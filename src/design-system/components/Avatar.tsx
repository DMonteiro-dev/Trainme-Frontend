import { theme } from '../theme';

interface AvatarProps {
    src?: string;
    alt: string;
    size?: number;
    fallback?: string;
    style?: React.CSSProperties;
}

export const Avatar = ({ src, alt, size = 48, fallback, style }: AvatarProps) => {
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return url;
    };

    const finalSrc = src ? getImageUrl(src) : undefined;
    const initials = fallback || alt.charAt(0).toUpperCase();

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: size * 0.4,
                fontWeight: 'bold',
                border: `2px solid ${theme.colors.surfaceAlt}`,
                ...style,
            }}
        >
            {finalSrc ? (
                <img
                    src={finalSrc}
                    alt={alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        // We could show fallback here by toggling state, but for simplicity in this dumb component
                        // we rely on the parent or just let the background show (which is primary color).
                        // A better way is to have a state for error.
                    }}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};
