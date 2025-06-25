"use client";

// src/index.tsx
import { Suspense, useLayoutEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { jsx } from "react/jsx-runtime";
function removeTags(tag) {
  const tagList = tag === "script" ? document.querySelectorAll("script[src*='dropinblog']") : document.querySelectorAll("link[href*='dropinblog']");
  tagList.forEach((t) => t.remove());
}
function createDibScript(blogId, onLoad) {
  const script = document.createElement("script");
  script.src = `https://io.dropinblog.com/embedjs/${blogId}.js`;
  script.async = true;
  script.onload = onLoad;
  return script;
}
function forceDibReload() {
  if (window.dib?.reload) {
    window.dib.reload();
  }
}
function normalizeDivLinks() {
  const linksSelector = [
    "ul.dib-cat-menu>li >a",
    "a.dib-post",
    "a.dib-post-back-link",
    "a.dib-post-back-link-bottom",
    "a.dib-meta-author-link",
    "div.dib-related-posts>div.dib-related-post",
    "span.dib-meta-item.dib-post-category-text a"
  ];
  const links = document.querySelectorAll(linksSelector.join(", "));
  links.forEach((link) => {
    if (link instanceof HTMLDivElement) {
      let onclick = link.getAttribute("onclick") ?? "";
      onclick = onclick.replace(/location\.href\s*=\s*['"]/, "");
      onclick = onclick.replace(/['"]\s*;\s*$/, "");
      link.setAttribute("data-href", onclick);
      link.removeAttribute("onclick");
    }
  });
  return links;
}
function addClickListeners(links, router) {
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      let url = null;
      if (link instanceof HTMLAnchorElement) {
        url = new URL(link.href);
      } else if (link instanceof HTMLDivElement) {
        const href = link.dataset?.href;
        if (href)
          url = new URL(href, window.location.origin);
      }
      if (!url)
        throw new Error("Invalid URL");
      const relativePath = url.pathname + url.search;
      router.push(relativePath);
    });
  });
}
function overrideLinkClicks(router) {
  const links = normalizeDivLinks();
  addClickListeners(links, router);
}
function DibBlock(props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchKey = searchParams.toString();
  useLayoutEffect(() => {
    if (pathname !== props.blogUrl)
      return;
    const dibContainer = document.getElementById("dib-posts");
    if (dibContainer)
      dibContainer.innerHTML = "";
    removeTags("script");
    const dibScript = createDibScript(props.blogId, () => {
      forceDibReload();
    });
    document.head.appendChild(dibScript);
    const observer = new MutationObserver(() => {
      overrideLinkClicks(router);
    });
    if (dibContainer) {
      observer.observe(dibContainer, {
        childList: true,
        subtree: true
      });
    }
    return () => {
      dibScript.remove();
      removeTags("link");
      observer.disconnect();
    };
  }, [pathname, searchKey, router]);
  if (props.fallback)
    return /* @__PURE__ */ jsx(Suspense, { fallback: props.fallback, children: /* @__PURE__ */ jsx("div", { id: "dib-posts" }) });
  return /* @__PURE__ */ jsx("div", { id: "dib-posts" });
}
export {
  DibBlock as default
};
