declare module 'next-mdx-remote/rsc' {
    import { ReactNode } from 'react';

    export interface MDXRemoteProps {
        source: string;
        components?: Record<string, React.ComponentType<any>>;
        options?: any;
    }

    export function MDXRemote(props: MDXRemoteProps): JSX.Element;
}
