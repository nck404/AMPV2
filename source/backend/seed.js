require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@libsql/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const bcrypt = require("bcryptjs");
const { fakerVI: faker } = require("@faker-js/faker");

const connectionString = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma;
if (connectionString.startsWith("libsql") || connectionString.startsWith("http")) {
    const libsql = createClient({ url: connectionString, authToken: authToken });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({ adapter });
} else {
    prisma = new PrismaClient();
}

const numUsers = 50;
const numPosts = 60;

const postTemplates = [
    { title: "Cách mình vượt qua khó khăn để bắt đầu công việc đầu tiên", content: "Chào mọi người, hôm nay mình muốn chia sẻ một câu chuyện dài về hành trình tìm việc của mình. Là một người khiếm thính, việc giao tiếp với đồng nghiệp đôi khi gặp không ít khó khăn. Những ngày đầu tiên đi làm, mình cảm thấy vô cùng lạc lõng và áp lực. Nhưng rồi, nhờ sự kiên trì học hỏi và sử dụng các công cụ hỗ trợ công nghệ, mình đã dần bắt nhịp được. Qua bài viết này, mình hy vọng truyền được ngọn lửa đam mê và sự tự tin đến những bạn cùng hoàn cảnh. Đừng bao giờ từ bỏ ước mơ của mình nhé, khó khăn chỉ là thử thách tạm thời thôi!" },
    { title: "Tầm quan trọng của việc phổ cập Ngôn Ngữ Ký Hiệu", content: "Ngôn ngữ ký hiệu không chỉ là phương tiện giao tiếp, mà còn là linh hồn của cộng đồng người khiếm thính. Mình nhận thấy rằng xã hội ngày nay đã mở lòng hơn rất nhiều, nhưng vẫn còn đó những rào cản vô hình. Nếu các trường học phổ thông có thể đưa ngôn ngữ ký hiệu vào như một môn học ngoại khóa, thì sự thấu hiểu và gắn kết giữa mọi người sẽ tăng lên gấp bội. Bài viết này mình xin phân tích sâu hơn về những lợi ích to lớn nếu điều này trở thành hiện thực. Mong mọi người cùng đọc và để lại suy nghĩ nhé." },
    { title: "Đánh giá các công cụ hỗ trợ đọc màn hình tốt nhất 2026", content: "Trong thời đại số hóa, việc tiếp cận thông tin là quyền cơ bản của mỗi người. Đối với cộng đồng người khiếm thị, các phần mềm đọc màn hình (Screen Reader) đóng vai trò như đôi mắt thứ hai. Hôm nay mình đã dành thời gian tổng hợp và so sánh chi tiết các công cụ tốt nhất hiện nay, từ NVDA, Jaws cho đến các tiện ích mở rộng trên trình duyệt. Phân tích chi tiết về ưu nhược điểm, độ phản hồi, và khả năng tương thích với tiếng Việt. Bạn nào đang phân vân không biết chọn công cụ nào thì hãy đọc kỹ bài viết này nhé!" },
    { title: "Trải nghiệm tham gia dự án cộng đồng AMP", content: "Tham gia vào dự án AMP là một trong những quyết định tuyệt vời nhất của mình trong năm nay. Nền tảng này không chỉ cung cấp các khóa học hữu ích mà còn là nơi giao lưu, kết bạn cực kỳ an toàn và thân thiện. Mình đã viết một bài đánh giá rất dài và chi tiết về từng tính năng, từ việc học ngôn ngữ ký hiệu qua AI, cho đến diễn đàn chia sẻ việc làm. Thực sự cảm ơn đội ngũ phát triển rất nhiều vì đã tạo ra một hệ sinh thái tuyệt vời như vậy." },
    { title: "Góc tâm sự: Khi gia đình không hiểu mình", content: "Có lẽ rất nhiều bạn ở đây đã từng trải qua cảm giác cô đơn ngay trong chính ngôi nhà của mình. Mình sinh ra không được may mắn như bao người, và đôi khi sự kỳ vọng quá lớn hoặc sự bao bọc quá mức từ gia đình lại trở thành gánh nặng tâm lý. Mình mất rất nhiều thời gian để có thể dũng cảm ngồi lại, viết một bức thư dài gửi cho bố mẹ, giải thích về những gì mình đang trải qua và những gì mình thực sự cần. Hãy đọc câu chuyện của mình để biết rằng bạn không hề cô đơn trên hành trình này." },
    { title: "Kinh nghiệm phỏng vấn dành cho người khuyết tật", content: "Nhiều bạn nhắn tin hỏi mình về bí quyết làm sao để tự tin khi đi phỏng vấn xin việc. Hôm nay mình quyết định viết một bài thật dài, tổng hợp lại toàn bộ kinh nghiệm xương máu của mình. Từ việc chuẩn bị CV sao cho làm nổi bật thế mạnh, đến cách trả lời những câu hỏi khó nhằn từ nhà tuyển dụng về tình trạng sức khỏe của bản thân. Điểm mấu chốt là phải cho họ thấy khả năng đóng góp và thái độ chuyên nghiệp của bạn. Hãy cùng thảo luận thêm ở phần bình luận nhé." },
    { title: "Làm thế nào để giữ tinh thần lạc quan mỗi ngày?", content: "Cuộc sống luôn có những thăng trầm, và với chúng ta, đôi khi những khó khăn lại nhân lên gấp bội. Vậy bí quyết nào giúp mình luôn giữ được nụ cười? Đầu tiên, mình luôn tạo cho bản thân những thói quen nhỏ tích cực mỗi buổi sáng. Tiếp theo, mình tìm kiếm niềm vui từ những điều giản dị nhất xung quanh. Trong bài blog này, mình xin chia sẻ 10 thói quen mình đã duy trì trong suốt 3 năm qua để cải thiện sức khỏe tinh thần. Rất mong nhận được sự đồng cảm từ mọi người." }
];

const commentTemplates = [
    "Bài viết của bạn thực sự chạm đến trái tim mình. Mình đã từng trải qua hoàn cảnh tương tự và rất hiểu cảm giác này. Những lời chia sẻ của bạn chi tiết và sâu sắc đến mức mình không thể ngừng đọc. Cảm ơn bạn vì đã dũng cảm nói lên tiếng lòng của rất nhiều người. Mong bạn sẽ tiếp tục ra nhiều bài viết chất lượng như thế này nữa nhé!",
    "Đọc bài này xong mình cảm thấy được tiếp thêm rất nhiều động lực. Bạn viết rất hay, văn phong mượt mà và các lập luận rất logic, thuyết phục. Mình sẽ lưu lại bài này để đọc lại mỗi khi cảm thấy chán nản hay mất phương hướng. Cảm ơn tác giả rất nhiều!",
    "Mình hoàn toàn đồng ý với quan điểm của bạn ở đoạn giữa. Tuy nhiên, ở phần cuối, mình nghĩ nếu bổ sung thêm một vài ví dụ thực tế nữa thì sẽ tuyệt vời hơn. Dù sao thì đây cũng là một góc nhìn rất mới mẻ và đáng để suy ngẫm. Mình đã share bài viết này cho bạn bè cùng đọc rồi.",
    "Thật sự cảm động khi đọc những dòng này. Cuộc sống luôn đầy rẫy những thử thách, nhưng cách bạn đối mặt và vượt qua nó chính là nguồn cảm hứng lớn lao cho cộng đồng. Bài viết khá dài nhưng mình đã đọc không sót một chữ nào. Cảm ơn bạn đã lan tỏa năng lượng tích cực này!",
    "Bài phân tích rất chi tiết và khách quan. Mình đánh giá cao sự đầu tư nghiên cứu của bạn trước khi viết bài này. Những thông tin bạn đưa ra rất hữu ích, đặc biệt là đối với những người mới bắt đầu tìm hiểu về lĩnh vực này như mình. Tuyệt vời quá bạn ơi!",
    "Một bài viết tuyệt vời! Lâu lắm rồi mình mới đọc được một bài blog chất lượng, có chiều sâu và được đầu tư kỹ lưỡng cả về nội dung lẫn hình thức trình bày như vậy. Bạn hãy tiếp tục phát huy nhé, cộng đồng đang rất cần những người có tâm và có tầm như bạn.",
    "Những chia sẻ này thực sự rất có ích cho những ai đang ở trong hoàn cảnh tương tự. Mình thấy bản thân mình đâu đó trong câu chuyện của bạn. Viết dài và viết hay thế này chắc bạn đã phải trăn trở rất nhiều. Cảm ơn vì tất cả những tâm huyết bạn đã gửi gắm."
];

async function main() {
    console.log("Seeding database...");
    
    // Create users
    const users = [];
    console.log(`Creating ${numUsers} users...`);
    const password_hash = await bcrypt.hash("123456", 10);
    
    for (let i = 0; i < numUsers; i++) {
        const username = faker.internet.username() + i; // prevent duplicate
        const email = faker.internet.email();
        const bio = faker.lorem.paragraphs(2, '\n');
        
        try {
            const user = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password_hash: password_hash,
                    public_id: Math.random().toString().substring(2, 8),
                    bio: bio,
                    avatar_url: faker.image.avatar()
                }
            });
            users.push(user);
        } catch(e) {}
    }
    
    console.log(`Created ${users.length} users successfully.`);
    if (users.length === 0) return;

    // Create posts
    const posts = [];
    console.log(`Creating ${numPosts} posts...`);
    for (let i = 0; i < numPosts; i++) {
        const author = faker.helpers.arrayElement(users);
        const template = faker.helpers.arrayElement(postTemplates);
        // Make it even longer by adding random paragraphs
        const longContent = template.content + "\n\n" + faker.lorem.paragraphs(5, '\n\n') + "\n\n" + faker.lorem.paragraphs(4, '\n\n');
        
        const post = await prisma.post.create({
            data: {
                author_id: author.id,
                title: template.title + " " + faker.lorem.words(3),
                content: longContent,
                tags: faker.helpers.arrayElements(["tâm_sự", "chia_sẻ", "việc_làm", "ngôn_ngữ_ký_hiệu", "đời_sống"], 2).join(",")
            }
        });
        posts.push(post);
    }
    
    console.log(`Created ${posts.length} posts successfully.`);

    // Create comments and replies
    console.log("Creating comments...");
    let commentCount = 0;
    let replyCount = 0;
    
    for (const post of posts) {
        // 5 to 15 root comments per post
        const numComments = faker.number.int({ min: 5, max: 15 });
        
        for (let i = 0; i < numComments; i++) {
            const author = faker.helpers.arrayElement(users);
            const template = faker.helpers.arrayElement(commentTemplates);
            const longComment = template + "\n" + faker.lorem.paragraph();
            
            const comment = await prisma.comment.create({
                data: {
                    post_id: post.id,
                    author_id: author.id,
                    content: longComment
                }
            });
            commentCount++;
            
            // Randomly create replies (1 to 4)
            if (faker.number.int({ min: 1, max: 100 }) > 50) {
                const numReplies = faker.number.int({ min: 1, max: 4 });
                for (let j = 0; j < numReplies; j++) {
                    const replyAuthor = faker.helpers.arrayElement(users);
                    const replyText = "Mình đồng ý với ý kiến của bạn. " + faker.lorem.paragraphs(2, '\n');
                    await prisma.comment.create({
                        data: {
                            post_id: post.id,
                            author_id: replyAuthor.id,
                            parent_id: comment.id,
                            content: replyText
                        }
                    });
                    replyCount++;
                }
            }
        }
    }
    
    console.log(`Created ${commentCount} root comments and ${replyCount} replies successfully.`);
    console.log("Done seeding!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
