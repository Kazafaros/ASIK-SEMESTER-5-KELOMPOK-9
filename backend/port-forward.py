#!/usr/bin/env python3
"""
Port Forwarding Tool for MarineEcoPredict
Forwards port 3000 (backend) to external access
"""

import socket
import threading
import sys
import time

LOCAL_HOST = "127.0.0.1"
LOCAL_PORT = 3000
EXTERNAL_PORT = 8080

def handle_client(client_socket, server_socket):
    """Handle client connection and forward to backend"""
    try:
        # Receive from client
        data = client_socket.recv(4096)
        if data:
            # Forward to backend
            server_socket.sendall(data)
            
            # Receive response from backend
            response = server_socket.recv(4096)
            if response:
                client_socket.sendall(response)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client_socket.close()
        server_socket.close()

def forward_port(local_host, local_port, external_port):
    """Main port forwarding server"""
    # Create listening socket
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        listener.bind(("0.0.0.0", external_port))
        listener.listen(5)
        print(f"🚀 Port Forwarding Active!")
        print(f"   Local:    http://localhost:{local_port}")
        print(f"   Forward:  http://localhost:{external_port}")
        print(f"   External: http://<your-ip>:{external_port}")
        print(f"\n⏹️  Press Ctrl+C to stop\n")
        
        while True:
            try:
                # Accept client connection
                client_socket, client_addr = listener.accept()
                print(f"📨 Connection from {client_addr[0]}:{client_addr[1]}")
                
                # Connect to backend
                server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                server_socket.connect((local_host, local_port))
                
                # Handle in thread
                thread = threading.Thread(
                    target=handle_client,
                    args=(client_socket, server_socket)
                )
                thread.daemon = True
                thread.start()
                
            except ConnectionRefusedError:
                print(f"⚠️  Cannot connect to {local_host}:{local_port}")
                print(f"   Make sure backend is running!")
                time.sleep(1)
                
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        listener.close()

if __name__ == "__main__":
    try:
        forward_port(LOCAL_HOST, LOCAL_PORT, EXTERNAL_PORT)
    except KeyboardInterrupt:
        print("\n\n⏹️  Port forwarding stopped")
        sys.exit(0)
