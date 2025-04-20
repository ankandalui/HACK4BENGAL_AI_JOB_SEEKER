import Container from "../global/container";
import Images from "../global/images";

const Companies = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20 mt-16 companies overflow-hidden">
            <Container>
                <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl lg:text-4xl font-medium">
                        Trusted by <span className="font-subheading italic">leading</span> brands
                    </h4>
                </div>
            </Container>

            <Container delay={0.1}>
                <div className="flex flex-row flex-wrap items-center justify-center gap-8 max-w-xl mx-auto pt-16 text-muted-foreground transition-all">
                    <Images.company1 className="h-7 w-auto hover:text-foreground" />
                    <Images.company2 className="h-7 w-auto hover:text-foreground" />
                    <Images.company3 className="h-7 w-auto hover:text-foreground" />
                    <Images.company6 className="h-7 w-auto hover:text-foreground" />
                    <Images.company7 className="h-7 w-auto hover:text-foreground" />
                    <Images.company9 className="h-7 w-auto hover:text-foreground" />
                    <Images.company10 className="h-7 w-auto hover:text-foreground" />
                </div>
            </Container>
        </div>
    )
};

export default Companies
