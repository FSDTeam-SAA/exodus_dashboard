
import { Suspense } from "react"
import LoginPages from "./_component/LoginFrom"


export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPages />
        </Suspense>
    )
}
