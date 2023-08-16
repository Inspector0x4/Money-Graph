


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head><title>Money Graph</title></head>
      <body>{children}</body>
    </html>
  )
}

