interface TruncateProps {
        text: string;
        length?: number;
        className?: string;
        defaultLength?: number;
        showTooltip?: boolean;
}

const Truncate = ({
        text,
        length = 100,
        className = '',
        defaultLength = 100,
        showTooltip = true,
}: TruncateProps) => {
        if (!text) return null;

        const shouldTruncate = text.length > (length || defaultLength);
        const truncatedText = shouldTruncate
                ? `${text.slice(0, length || defaultLength).trim()}...`
                : text;

        return (
                <span
                        className={className}
                        title={showTooltip && shouldTruncate ? text : undefined}
                >
                        {truncatedText}
                </span>
        );
};

export default Truncate;