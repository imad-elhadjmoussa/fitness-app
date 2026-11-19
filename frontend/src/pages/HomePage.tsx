import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

type Feature = {
    title: string
    description: string
}

const features: Feature[] = [
    {
        title: "Accessible",
        description: "Built on Radix primitives, so keyboard and screen reader support come built in.",
    },
    {
        title: "Customizable",
        description: "Components are copied into your project. Edit them however you like.",
    },
    {
        title: "Typed",
        description: "Written in TypeScript, with props and variants you can autocomplete.",
    },
]

export default function HomePage() {
    const [email, setEmail] = useState<string>("")
    const [submitted, setSubmitted] = useState<boolean>(false)

    const handleSubscribe = () => {
        if (!email.includes("@")) return
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <header className="border-b">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    <span className="font-semibold">Test App</span>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Docs</Button>
                        <Button variant="ghost" size="sm">Pricing</Button>
                        <Button size="sm">Sign in</Button>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-16 px-4 py-16">
                {/* Hero */}
                <section className="space-y-6 text-center">
                    <Badge variant="secondary">shadcn/ui + React + TypeScript</Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        A simple home page to test your setup
                    </h1>
                    <p className="mx-auto max-w-xl text-muted-foreground">
                        If you can see styled buttons, cards, tabs and inputs below, shadcn/ui is working.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button size="lg">Get started</Button>
                        <Button size="lg" variant="outline">View on GitHub</Button>
                    </div>
                </section>

                <Separator />

                {/* Feature cards */}
                <section className="grid gap-4 sm:grid-cols-3">
                    {features.map((f) => (
                        <Card key={f.title}>
                            <CardHeader>
                                <CardTitle>{f.title}</CardTitle>
                                <CardDescription>{f.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </section>

                {/* Tabs */}
                <section className="mx-auto max-w-xl">
                    <Tabs defaultValue="signup">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signup">Newsletter</TabsTrigger>
                            <TabsTrigger value="about">About</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signup">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stay in the loop</CardTitle>
                                    <CardDescription>Get updates when we ship something new.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </CardContent>
                                <CardFooter className="flex items-center justify-between">
                                    <Button onClick={handleSubscribe}>Subscribe</Button>
                                    {submitted && <Badge>Subscribed</Badge>}
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="about">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About this page</CardTitle>
                                    <CardDescription>
                                        This page only exists to check that your components render correctly.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>
            </main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                Built with shadcn/ui
            </footer>
        </div>
    )
}