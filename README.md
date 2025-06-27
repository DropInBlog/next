# DropInBlog Next.js Integration

A React component that seamlessly integrates DropInBlog into your Next.js application.

## Installation

```bash
npm install @dropinblog/nextjs
# or
yarn add @dropinblog/nextjs
# or
pnpm add @dropinblog/nextjs
```

## Usage

1. **Import the component** in your blog page:

```tsx
import DibBlock from '@dropinblog/nextjs';
```

2. **Add the component** to your blog page:

```tsx
export default function BlogPage() {
  return (
    <div>
      <DibBlock blogUrl="/blog" blogId="your-dropinblog-id" />
    </div>
  );
}
```

## API Reference

### DibBlock Props

| Prop       | Type     | Required | Description                                                  |
| ---------- | -------- | -------- | ------------------------------------------------------------ |
| `blogUrl`  | `string` | ✅       | The base URL path where your blog is mounted (e.g., `/blog`) |
| `blogId`   | `string` | ✅       | Your DropInBlog ID from your DropInBlog dashboard            |
| `fallback` | `JSX`    | ❌       | Fallback component                                           |
