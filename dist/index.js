"use strict";
"use client";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  default: () => DibBlock
});
module.exports = __toCommonJS(src_exports);
var import_react = require("react");
var import_navigation = require("next/navigation");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const pathname = (0, import_navigation.usePathname)();
  const searchParams = (0, import_navigation.useSearchParams)();
  const router = (0, import_navigation.useRouter)();
  const searchKey = searchParams.toString();
  (0, import_react.useLayoutEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: props.fallback, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "dib-posts" }) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "dib-posts" });
}
