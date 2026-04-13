import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingBandTitle, landingFooterColumnTitle, landingSectionLead } from "@/components/landing/typography";

const footerLinks = {
    Product: ["Features", "Pricing", "Integration", "Changelog"],
    Resources: ["Documentation", "Guides", "API Status"],
    Company: ["About", "Blog", "Careers"],
    Legal: ["Privacy", "Terms"],
};

export function Footer() {
    return (
        <footer className="bg-[#F5F0E8] landing-grain" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>

            {/* CTA band */}
            <div className="border-t border-zinc-200/60">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h3 className={landingBandTitle}>Ready to create your first video?</h3>
                        <p className={`mt-2 ${landingSectionLead}`}>
                            Start for free. No credit card required.
                        </p>
                    </div>
                    <Link href="/sign-up">
                        <Button className="h-11 px-7 text-sm font-medium bg-[#f2d412] text-zinc-900 hover:bg-[#f2c112] rounded-full shadow-sm transition-all hover:-translate-y-px">
                            Get started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Links */}
            <div className="border-t border-zinc-200/60">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 sm:py-12">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
                        <div className="max-w-xs shrink-0">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-emerald-100 overflow-hidden shrink-0">
                                    <Image src="/logo.png" alt="Agent Elephant Logo" width={80} height={80} className="object-cover scale-125" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-zinc-900">Agent Elephant</span>
                            </Link>
                            <p className="mt-4 text-sm leading-6 text-zinc-500">
                                AI-powered video creation and scheduling for the modern content creator.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-between gap-x-12 gap-y-8">
                            {Object.entries(footerLinks).map(([category, links]) => (
                                <div key={category}>
                                    <h4 className={landingFooterColumnTitle}>{category}</h4>
                                    <ul className="space-y-3">
                                        {links.map((link) => (
                                            <li key={link}>
                                                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-zinc-400">
                            &copy; {new Date().getFullYear()} Agent Elephant Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-5">
                            <a
                                href="https://x.com/hellostores_app"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-zinc-900/80 hover:text-zinc-900 transition-colors"
                                aria-label="X"
                                title="X"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a
                                href="https://www.instagram.com/hellostores_app/"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[#E1306C] hover:text-[#C13584] transition-colors"
                                aria-label="Instagram"
                                title="Instagram"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8z" />
                                    <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z" />
                                    <path d="M17.7 6.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.youtube.com/@HelloStores-u3h"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[#FF0000] hover:text-[#CC0000] transition-colors"
                                aria-label="YouTube"
                                title="YouTube"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/110907522/admin/dashboard/"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[#0A66C2] hover:text-[#004182] transition-colors"
                                aria-label="LinkedIn"
                                title="LinkedIn"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
