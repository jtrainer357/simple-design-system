import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple password protection for hackathon demo
const DEMO_PASSWORD = "TebeMHMVP2026!";
const COOKIE_NAME = "mhmvp-auth";

export function middleware(request: NextRequest) {
  // Skip auth for static files and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // Check for password in query params (for initial auth)
  const password = request.nextUrl.searchParams.get("password");
  if (password === DEMO_PASSWORD) {
    const response = NextResponse.redirect(new URL(request.nextUrl.pathname, request.url));
    response.cookies.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  // Show login page
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <title>MHMVP Demo Access</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .logo {
      width: 120px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 8px;
    }
    p {
      color: #666;
      margin-bottom: 32px;
    }
    input {
      width: 100%;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #E86C4F;
    }
    button {
      width: 100%;
      padding: 16px;
      background: #E86C4F;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #d55a3f;
    }
    .error {
      color: #e74c3c;
      margin-bottom: 16px;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='50' y='22' text-anchor='middle' font-family='Arial' font-weight='bold' font-size='24' fill='%23E86C4F'%3Etebra%3C/text%3E%3C/svg%3E" alt="Tebra" class="logo">
    <h1>MHMVP Demo</h1>
    <p>Mental Health MVP - Hackathon Demo</p>
    <p id="error" class="error">Incorrect password. Please try again.</p>
    <form id="authForm">
      <input type="password" id="password" placeholder="Enter demo password" autofocus>
      <button type="submit">Access Demo</button>
    </form>
  </div>
  <script>
    document.getElementById('authForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('password').value;
      window.location.href = window.location.pathname + '?password=' + encodeURIComponent(password);
    });
    if (window.location.search.includes('password=')) {
      document.getElementById('error').classList.add('show');
    }
  </script>
</body>
</html>`,
    {
      status: 401,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
