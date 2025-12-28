export type hDirection = 'left' | 'right';

// Extracted SVG line attributes for reusability
export const SVG_LINE_ATTRIBUTES = {
    fill: "none",
    stroke: "#000",
    strokeLinejoin: "miter" as const,
    strokeLinecap: "butt" as const,
    strokeWidth: 2,
} as const;

// Common SVG dimensions and positions
export const BRACKET_CONFIG = {
    verticalLineX: 5,
    horizontalLineLength: 10,
} as const;

export function Bracket({ direction, height }: { direction: hDirection, height: number }) {
    const { fill, stroke, strokeWidth, strokeLinejoin, strokeLinecap } = SVG_LINE_ATTRIBUTES;
    const { verticalLineX, horizontalLineLength } = BRACKET_CONFIG;
    
    // Adjust coordinates based on direction
    const isLeft = direction === 'left';
    const x2 = isLeft ? verticalLineX + horizontalLineLength : verticalLineX;
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="90" height={height + 10}>
            <g>
                {/* Vertical line */}
                <line 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth={strokeWidth}
                    strokeLinejoin={strokeLinejoin} 
                    strokeLinecap={strokeLinecap} 
                    x1={isLeft ? verticalLineX : verticalLineX + horizontalLineLength} 
                    y1="5" 
                    x2={isLeft ? verticalLineX : verticalLineX + horizontalLineLength} 
                    y2={height} 
                    id="vertical_line" 
                />
                {/* Top horizontal line */}
                <line 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth={strokeWidth}
                    strokeLinejoin={strokeLinejoin} 
                    strokeLinecap={strokeLinecap}
                    x1={isLeft ? verticalLineX : verticalLineX + horizontalLineLength} 
                    y1="5" 
                    x2={x2} 
                    y2="5" 
                    id="top_line" 
                />
                {/* Bottom horizontal line */}
                <line 
                    fill={fill} 
                    stroke={stroke} 
                    strokeWidth={strokeWidth}
                    strokeLinejoin={strokeLinejoin} 
                    strokeLinecap={strokeLinecap}
                    x1={isLeft ? verticalLineX : verticalLineX + horizontalLineLength} 
                    y1={height} 
                    x2={x2} 
                    y2={height} 
                    id="bottom_line" 
                />
            </g>
        </svg>
    )
}