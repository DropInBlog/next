import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

declare global {
    interface Window {
        dib?: {
            reload?: () => void;
            [key: string]: any;
        };
    }
}
type DibBlogOptions = {
    blogUrl: string;
    blogId: string;
    fallback?: ReactNode;
};
/**
 * Main component that loads and integrates DropInBlog content
 * into a Next.js page for example ("/blog")
 */
declare function DibBlock(props: DibBlogOptions): react_jsx_runtime.JSX.Element;

export { type DibBlogOptions, DibBlock as default };
