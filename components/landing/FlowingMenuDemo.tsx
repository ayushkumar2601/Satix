import FlowingMenu from "../FlowingMenu";

const demoItems = [
  { 
    link: '/education', 
    text: 'Education', 
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop' 
  },
  { 
    link: '/documentation', 
    text: 'Documentation', 
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' 
  },
  { 
    link: '/about', 
    text: 'About Us', 
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop' 
  },
  { 
    link: '/contact', 
    text: 'Contact', 
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&h=400&fit=crop' 
  }
];

export default function FlowingMenuSection() {
  return (
    <section className="section !p-0" style={{ position: 'relative', backgroundColor: 'oklch(0.92 0.04 350)' }}>
      <div style={{ height: '600px', position: 'relative' }}>
        <FlowingMenu
          items={demoItems}
          speed={15}
          textColor="oklch(0.15 0 0)" // --foreground (near black)
          bgColor="oklch(0.92 0.04 350)" // --pink (soft pink background)
          marqueeBgColor="oklch(0.97 0.01 90)" // --cream (cream for marquee)
          marqueeTextColor="oklch(0.55 0.2 25)" // --red (red accent for marquee text)
          borderColor="oklch(0.88 0.01 90)" // --border (subtle border)
        />
      </div>
    </section>
  );
}
