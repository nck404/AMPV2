import os
import sys
import subprocess

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    if os.name == 'nt':
        venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    else:
        venv_python = os.path.join(backend_dir, "venv", "bin", "python")
        
    server_script = os.path.join(backend_dir, "server.py")

    if not os.path.exists(venv_python):
        print("Virtual Environment (venv) không tồn tại. Đang tự động khởi tạo...")
        try:
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True, cwd=backend_dir)
            print("Đã khởi tạo venv thành công.")
            
            requirements_path = os.path.join(backend_dir, "requirements.txt")
            if os.path.exists(requirements_path):
                print("Đang tự động cài đặt tài nguyên (requirements.txt)...")
                subprocess.run([venv_python, "-m", "pip", "install", "-r", "requirements.txt"], check=True, cwd=backend_dir)
                print("Đã cài đặt tài nguyên thành công.")
            else:
                print("Không tìm thấy requirements.txt.")
        except Exception as e:
            print(f"Lỗi khi khởi tạo venv hoặc cài đặt tài nguyên: {e}")
            sys.exit(1)
        
    if not os.path.exists(server_script):
        print("Không tìm thấy file server.py trong thư mục Backend.")
        sys.exit(1)

    domain = "http://localhost:6333"
    env_file = os.path.join(backend_dir, ".env")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DOMAIN=") or line.startswith("PUBLIC_URL="):
                    domain = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

    print("="*50)
    print("BẮT ĐẦU KHỞI ĐỘNG HỆ THỐNG BACKEND")
    print(f"Môi trường ảo (Venv): Đang kích hoạt tự động")
    print(f"Python: {venv_python}")
    print(f"Target: {server_script}")
    print(f"Domain Backend: {domain}")
    print("="*50 + "\n")

    try:
        if os.name == 'posix':
            os.chdir(backend_dir)
            os.execl(venv_python, venv_python, server_script)
        else:
            os.chdir(backend_dir)
            subprocess.run([venv_python, server_script])
    except KeyboardInterrupt:
        print("\nĐã nhận lệnh dừng từ người dùng.")
    except Exception as e:
        print(f"\nĐã xảy ra lỗi khi khởi động: {e}")

if __name__ == "__main__":
    main()
