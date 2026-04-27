import os
import sys
import random
import time
import json
import requests

# Add Backend directory to sys.path so we can import its modules
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "Backend")
sys.path.insert(0, backend_dir)

# Change working directory to Backend so DB path resolves correctly
os.chdir(backend_dir)

try:
    from app import create_app
    from extensions import db
    from models import User, Post, Comment
except ImportError as e:
    print(f"Failed to import backend modules: {e}")
    sys.exit(1)

# Config Mistral AI
MISTRAL_API_KEY = "rIFFB9GC0tdedtgv1sCedxlkeg3Fp7X6"
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"

def safe_print(msg):
    try:
        print(msg.encode('utf-8', errors='replace').decode('utf-8'))
    except:
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except:
            pass

def generate_content(prompt):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MISTRAL_API_KEY}"
    }
    data = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7 
    }
    try:
        response = requests.post(MISTRAL_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        safe_print(f"Error calling Mistral: {e}")
        return None

def main():
    app = create_app()
    with app.app_context():
        users = User.query.all()
        if not users:
            print("No users found in database. Please create some users first.")
            return

        print(f"Found {len(users)} users. Starting RANDOM PROFESSIONAL generation with Mistral AI...")

        categories = [
            {
                "name": "Kinh tế & Công việc",
                "prompt": "Bạn là một người có kinh nghiệm, hãy viết bài chia sẻ về KINH TẾ hoặc CÔNG VIỆC. Thái độ chuyên nghiệp, lịch sự. Tập trung vào xu hướng lao động, quản lý tài chính hoặc kỹ năng công sở. Tránh dùng từ lóng.",
                "tags": "#kinhte, #nghenghiep, #tuvan"
            },
            {
                "name": "Học tập & Phát triển",
                "prompt": "Bạn là một người đang học hỏi, hãy viết bài chia sẻ về quá trình HỌC TẬP (đặc biệt là ngôn ngữ ký hiệu hoặc kỹ năng mới). Thái độ nghiêm túc, tích cực. Chia sẻ mẹo học hiệu quả hoặc tiến độ bản thân.",
                "tags": "#hoctap, #phattrien, #ngonngukyhieu"
            },
            {
                "name": "Đời sống & Nghị lực",
                "prompt": "Hãy viết bài chia sẻ về CUỘC SỐNG thường ngày, những câu chuyện về nghị lực vượt khó hoặc trải nghiệm cá nhân. Thái độ chân thành, chuyên nghiệp nhưng gần gũi. Mang tính truyền cảm hứng.",
                "tags": "#doisong, #nghiluc, #chiase"
            }
        ]

        # Target: 50 posts
        num_posts_to_gen = 50
        
        for i in range(num_posts_to_gen):
            author = random.choice(users)
            cat = random.choice(categories)
            
            safe_print(f"Generating post {i+1}/{num_posts_to_gen} [{cat['name']}] by {author.username}...")
            
            prompt_post = (
                f"{cat['prompt']}\n"
                "YÊU CẦU: Độ dài 150-250 chữ. Tiêu đề rõ ràng, súc tích. "
                f"Trả về JSON: {{\"title\": \"...\", \"content\": \"...\", \"tags\": \"{cat['tags']}\"}}"
            )
            
            post_data_raw = generate_content(prompt_post)
            if not post_data_raw:
                continue
            
            clean_json = post_data_raw.replace('```json', '').replace('```', '').strip()
            try:
                post_data = json.loads(clean_json)
                new_post = Post(
                    author_id=author.id,
                    title=post_data.get('title', 'Bài viết cộng đồng'),
                    content=post_data.get('content', ''),
                    tags=post_data.get('tags', cat['tags'])
                )
                db.session.add(new_post)
                db.session.commit()
                safe_print(f"  [+] Post: {new_post.title[:50]}...")

                # Generate 3-6 comments per post
                num_comments = random.randint(3, 6)
                top_level_comments = []

                for j in range(num_comments):
                    commenter = random.choice(users)
                    prompt_comment = (
                        f"Viết 1 bình luận ngắn (1-2 câu) phản hồi bài đăng này một cách chuyên nghiệp và lịch sự. "
                        f"Bài đăng: {new_post.title}\n"
                        f"Nội dung: {new_post.content[:100]}..."
                    )
                    
                    content = generate_content(prompt_comment)
                    if content:
                        new_comment = Comment(
                            post_id=new_post.id,
                            author_id=commenter.id,
                            content=content
                        )
                        db.session.add(new_comment)
                        db.session.commit()
                        top_level_comments.append(new_comment)
                
                # Add replies to make it look active
                for _ in range(random.randint(1, 3)):
                    if not top_level_comments: break
                    parent = random.choice(top_level_comments)
                    replier = random.choice(users)
                    
                    prompt_reply = (
                        f"Viết 1 câu trả lời chuyên nghiệp và lịch sự cho bình luận: '{parent.content}'."
                    )
                    
                    reply_content = generate_content(prompt_reply)
                    if reply_content:
                        reply = Comment(
                            post_id=new_post.id,
                            author_id=replier.id,
                            parent_id=parent.id,
                            content=reply_content
                        )
                        db.session.add(reply)
                
                db.session.commit()
                safe_print(f"  [+] Discussions added.")
                
            except Exception as e:
                safe_print(f"Error: {e}")
                db.session.rollback()
            
            time.sleep(1)

        print("Finished generating diversified high-quality data!")

if __name__ == "__main__":
    main()
