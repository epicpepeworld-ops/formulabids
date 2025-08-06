export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 py-12 md:h-32 md:py-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
                    <p className="text-sm leading-loose text-muted-foreground">
                        Built by F1 fans for F1 fans
                    </p>
                    <p className="text-sm leading-loose text-muted-foreground">
                        Need Help? Send us a{" "}
                        <a 
                            href="https://t.me/FormulaBidsBot" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#34f876] hover:text-[#2ed968] underline"
                        >
                            message
                        </a>
                        .
                    </p>
                </div>
            </div>
        </footer>
    )
}
