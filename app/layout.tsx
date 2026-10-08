import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"島根AIハッカソン2027｜この地から、まだ見ぬ未来を。",description:"2027年2月末〜3月上旬、松江市内で開催予定。学生のアイデアとAIで、島根や企業の課題解決に挑む1DAYハッカソン。初心者歓迎。TSK「みらチャレ」との連携に向けて調整中。学生参加申込・企業や団体の参加／関心登録を受付中。",icons:{icon:"/favicon.png",shortcut:"/favicon.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
