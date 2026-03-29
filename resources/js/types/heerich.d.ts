declare module 'heerich' {
    export type HeerichCamera =
        | { type?: 'oblique'; angle?: number; distance?: number }
        | {
              type: 'perspective';
              position?: [number, number];
              distance?: number;
          };

    export type HeerichStyle = Record<
        string,
        string | number | Record<string, string | number>
    >;

    export class Heerich {
        constructor(opts?: {
            tile?: [number, number];
            camera?: HeerichCamera;
            style?: HeerichStyle;
        });

        setCamera(opts: HeerichCamera): void;

        clear(): void;

        addSphere(opts: {
            center: [number, number, number];
            radius: number;
            mode?: 'union' | 'subtract' | 'intersect' | 'exclude';
            style?:
                | HeerichStyle
                | ((x: number, y: number, z: number) => HeerichStyle);
        }): void;

        addLine(opts: {
            from: [number, number, number];
            to: [number, number, number];
            radius?: number;
            shape?: 'rounded' | 'square';
            mode?: 'union' | 'subtract' | 'intersect' | 'exclude';
            style?:
                | HeerichStyle
                | ((x: number, y: number, z: number) => HeerichStyle);
        }): void;

        addWhere(opts: {
            bounds: [[number, number, number], [number, number, number]];
            test: (x: number, y: number, z: number) => boolean;
            mode?: 'union' | 'subtract' | 'intersect' | 'exclude';
            style?:
                | HeerichStyle
                | ((x: number, y: number, z: number) => HeerichStyle);
        }): void;

        removeWhere(opts: {
            bounds: [[number, number, number], [number, number, number]];
            test: (x: number, y: number, z: number) => boolean;
        }): void;

        toSVG(opts?: {
            padding?: number;
            viewBox?: [number, number, number, number];
            offset?: [number, number];
            prepend?: string;
            append?: string;
        }): string;
    }
}
