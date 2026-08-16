import CrbcLayout from "../components/CrbcLayout"
//import { protectRoute } from "../lib/auth/protect"

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
   // await protectRoute("staff","profiles");

    return <CrbcLayout>{children}</CrbcLayout>
}
