'use client';

import { ReactNode, Suspense, useLayoutEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

// Declare DropInBlog global object on the window for TypeScript
declare global {
  interface Window {
    dib?: {
      reload?: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }
}

export type DibBlogOptions = {
  blogUrl: string;
  blogId: string;
  fallback?: ReactNode;
};

/**
 * Remove all <script> or <link> tags related to DropInBlog
 */
function removeTags(tag: 'link' | 'script') {
  const tagList =
    tag === 'script'
      ? document.querySelectorAll("script[src*='dropinblog']")
      : document.querySelectorAll("link[href*='dropinblog']");

  tagList.forEach((t) => t.remove());
}

/**
 * Create and return the DropInBlog <script> element with an onLoad callback
 */
function createDibScript(blogId: string, onLoad: () => void) {
  const script = document.createElement('script');
  script.src = `https://io.dropinblog.com/embedjs/${blogId}.js`;
  script.async = true;
  script.onload = onLoad;
  return script;
}

/**
 * Force DropInBlog to reload content if it's already loaded
 */
function forceDibReload() {
  if (window.dib?.reload) {
    window.dib.reload();
  }
}

/**
 * Find all clickable blog elements (both <a> and <div>),
 * and normalize <div> links by extracting href from onclick attribute
 */
function normalizeDivLinks() {
  const linksSelector = [
    'ul.dib-cat-menu>li >a',
    'a.dib-post',
    'a.dib-post-back-link',
    'a.dib-post-back-link-bottom',
    'a.dib-meta-author-link',
    'div.dib-related-posts>div.dib-related-post',
    'span.dib-meta-item.dib-post-category-text a',
  ];

  const links = document.querySelectorAll(linksSelector.join(', '));

  links.forEach((link) => {
    if (
      link instanceof HTMLDivElement &&
      link.hasAttribute('onclick') &&
      !link.hasAttribute('data-href')
    ) {
      // Extract href value from onclick="location.href='...'" and store in data-href
      let onclick = link.getAttribute('onclick') ?? '';
      onclick = onclick.replace(/location\.href\s*=\s*['"]/, '');
      onclick = onclick.replace(/['"]\s*;\s*$/, '');
      link.setAttribute('data-href', onclick);
      link.removeAttribute('onclick');
    }
  });

  return links;
}

/**
 * Add click event listeners to links (both <a> and normalized <div>s)
 * to handle navigation using Next.js router (client-side routing)
 */
function addClickListeners(
  links: NodeListOf<Element>,
  router: ReturnType<typeof useRouter>
) {
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      let url: URL | null = null;

      if (link instanceof HTMLAnchorElement) {
        url = new URL(link.href);
      } else if (link instanceof HTMLDivElement) {
        const href = link.dataset?.href;
        if (href) url = new URL(href, window.location.origin);
      }

      if (!url) throw new Error('Invalid URL');

      const relativePath = url.pathname + url.search;
      router.push(relativePath); // Navigate using Next.js router
    });
  });
}

/**
 * Normalize DropInBlog internal links and override them
 * to use Next.js client-side routing
 */
function overrideLinkClicks(router: ReturnType<typeof useRouter>) {
  const links = normalizeDivLinks(); // Clean and prepare <div> links
  addClickListeners(links, router); // Add SPA-compatible navigation
}

/**
 * Main component that loads and integrates DropInBlog content
 * into a Next.js page for example ("/blog")
 */
export default function DibBlock(props: DibBlogOptions) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // This ensures the effect runs again if the query string changes
  const searchKey = searchParams.toString();

  useLayoutEffect(() => {
    if (pathname !== props.blogUrl) return;

    const dibContainer = document.getElementById('dib-posts');
    if (dibContainer) dibContainer.innerHTML = '';

    removeTags('script');

    const dibScript = createDibScript(props.blogId, () => {
      forceDibReload();
    });

    document.head.appendChild(dibScript);

    // Set up MutationObserver to monitor new links
    const observer = new MutationObserver(() => {
      overrideLinkClicks(router);
    });

    if (dibContainer) {
      observer.observe(dibContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      dibScript.remove();
      removeTags('link');
      observer.disconnect(); // stop observing when unmounted
    };
  }, [pathname, searchKey, router]);

  if (props.fallback)
    return (
      <Suspense fallback={props.fallback}>
        <div id="dib-posts"></div>
      </Suspense>
    );

  return <div id="dib-posts"></div>;
}
