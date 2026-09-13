import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"島根AIハッカソン2026｜AIで、島根の未来をつくろう。",description:"2026年12月19日（土）松江・ENUN開催。学生のアイデアとAIで、島根や企業の課題解決に挑む1DAYハッカソン。初心者歓迎、学生参加無料、優勝賞金10万円。学生参加申込・企業や団体の参加／関心登録を受付中。",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
