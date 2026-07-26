import subprocess
import time
import sys
import os
import signal

BACKEND_FILE = "app.py"

class AMPManager:
    def __init__(self):
        self.backend_process = None
        self.keep_running = True
        
    def start_backend(self):
        print(f"[⚙️ Backend] Đang khởi động {BACKEND_FILE}...")
        self.backend_process = subprocess.Popen(
            [sys.executable, BACKEND_FILE],
            cwd=os.path.dirname(os.path.abspath(__file__))
        )

    def monitor(self):
        try:
            self.start_backend()

            print("\n" + "="*50)
            print("🛡️  AMP NEURAL CORE MANAGER IS RUNNING")
            print(f"💻 Backend: Tự động hồi phục nếu crash")
            print("⌨️  Nhấn Ctrl+C để dừng hệ thống")
            print("="*50 + "\n")

            while self.keep_running:
                if self.backend_process.poll() is not None:
                    print("\n[⚠️ Warning] Backend đã dừng! Đang khởi động lại sau 2 giây...")
                    time.sleep(2)
                    self.start_backend()

                time.sleep(1)

        except KeyboardInterrupt:
            self.stop_all()

    def stop_all(self):
        print("\n[🛑 Stop] Đang dừng hệ thống...")
        self.keep_running = False
        if self.backend_process:
            self.backend_process.terminate()
        print("[✅ Done] Đã tắt toàn bộ tiến trình.")
        sys.exit(0)

if __name__ == "__main__":
    manager = AMPManager()
    manager.monitor()
