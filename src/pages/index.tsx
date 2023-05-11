import Head from 'next/head'
import dynamic from "next/dynamic";
import { CumulioDashboard } from "@cumul.io/react-cumulio-dashboard";
import {useEffect, useState} from "react";

// Dynamic import is required to avoid import issues with Next
// See: https://academy.cumul.io/article/9974zmqb
const CumulioDashboardComponent = dynamic<
    Pick<
        CumulioDashboard,
        | "authKey"
        | "authToken"
        | "dashboardId"
    >
>(
    () =>
        import("@cumul.io/react-cumulio-dashboard").then(
            (module) => module.CumulioDashboardComponent,
        ),
    { ssr: false },
);


export default function Home() {
    const [credentials, setCredentials] = useState<{ id: string, token: string } | null>(null);
    useEffect(() => {
        if (credentials) return;
        fetch("https://api.cumul.io/0.1.0/authorization", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                action: "create",
                version: "0.1.0",
                key: process.env.NEXT_PUBLIC_INTEGRATION_KEY,
                token: process.env.NEXT_PUBLIC_INTEGRATION_TOKEN,
                properties: {
                    integration_id: process.env.NEXT_PUBLIC_INTEGRATION_ID,
                    type: "sso",
                    expiry: "24 hours",
                    inactivity_interval: "10 minutes",
                    username: "demo-user",
                    name: "User for demo",
                    email: "user@example.com",
                    suborganization: "Apiday",
                    role: "viewer",
                    metadata: {"entity": 2}
                }
            })
        })
            .then(response => response.json())
            .then(json => setCredentials(json));
    }, [credentials])
    return (
        <>
            <Head>
                <title>Multi-tenant demo</title>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <main>
                <section>
                    <h1>Dashboard</h1>
                    {
                        credentials ? <CumulioDashboardComponent
                            authKey={credentials.id}
                            authToken={credentials.token}
                            dashboardId={process.env.NEXT_PUBLIC_DASHBOARD_ID}
                        /> : "Loading"
                    }
                </section>
            </main>
        </>
    )
}
