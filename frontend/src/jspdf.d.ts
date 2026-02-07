declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    text(text: string | string[], x: number, y: number, options?: any): void;
    setFontSize(size: number): void;
    setFont(fontName: string, fontStyle?: string): void;
    setTextColor(r: number, g: number, b: number): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    addPage(): void;
    save(filename: string): void;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }
}
