import "./globals.css";

export const metadata = {
  title: "路书工坊",
  description: "带娃自驾/房车家庭的路书协作工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
