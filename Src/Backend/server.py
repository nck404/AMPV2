import subprocess
import time
import sys
import os
import signal
import platform

BACKEND_FILE = "app.py"
PORT = 5000
TUNNEL_COMMAND = ["cloudflared", "tunnel", "--url", f"http://localhost:{PORT}"]

class AMPManager:
    def __init__(self):
        self.backend_process = None
        self.tunnel_process = None
        self.keep_running = True

    def start_tunnel(self):
        print("\n[🚀 Tunnel] Khởi động Cloudflare Tunnel...")
        self.tunnel_process = subprocess.Popen(
            TUNNEL_COMMAND,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
    def start_backend(self):
        print(f"[⚙️ Backend] Đang khởi động {BACKEND_FILE}...")
        self.backend_process = subprocess.Popen(
            [sys.executable, BACKEND_FILE],
            cwd=os.path.dirname(os.path.abspath(__file__))
        )

    def monitor(self):
        try:
            self.start_tunnel()
            self.start_backend()

            print("\n" + "="*50)
            print("🛡️  AMP NEURAL CORE MANAGER IS RUNNING")
            print(f"📡 Tunnel: Luôn duy trì kết nối")
            print(f"💻 Backend: Tự động hồi phục nếu crash")
            print("⌨️  Nhấn Ctrl+C để dừng tất cả")
            print("="*50 + "\n")

            while self.keep_running:
                if self.backend_process.poll() is not None:
                    print("\n[⚠️ Warning] Backend đã dừng! Đang khởi động lại sau 2 giây...")
                    time.sleep(2)
                    self.start_backend()

                if self.tunnel_process.poll() is not None:
                    print("\n[⚠️ Warning] Tunnel đã mất kết nối! Đang kết nối lại...")
                    self.start_tunnel()

                if self.tunnel_process.stdout:
                    line = self.tunnel_process.stdout.readline()
                    if ".trycloudflare.com" in line:
                        print(f"🌍 PUBLIC URL: {line.strip()}")

                time.sleep(1)

        except KeyboardInterrupt:
            self.stop_all()

    def stop_all(self):
        print("\n[🛑 Stop] Đang dừng hệ thống...")
        self.keep_running = False
        if self.backend_process:
            self.backend_process.terminate()
        if self.tunnel_process:
            self.tunnel_process.terminate()
        print("[✅ Done] Đã tắt toàn bộ tiến trình.")
        sys.exit(0)

if __name__ == "__main__":
    manager = AMPManager()
    manager.monitor()

