// Minimal whitelist-based HTML sanitizer.
//
// CoinGecko's coin description field can contain arbitrary HTML submitted
// by project owners. Rendering it with v-html directly is an XSS vector
// (e.g. <img onerror=...>, <script>, javascript: hrefs). We don't have a
// dependency like DOMPurify installed, so this keeps only a small set of
// safe formatting tags/attributes and strips everything else.

const ALLOWED_TAGS = new Set([
  "A", "B", "I", "EM", "STRONG", "P", "BR", "UL", "OL", "LI", "SPAN",
])

const ALLOWED_ATTRS = {
  A: new Set(["href", "target", "rel"]),
}

function isSafeUrl(url) {
  if (!url) return false
  const trimmed = url.trim().toLowerCase()
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:")
}

function cleanNode(node) {
  // Text nodes are always safe as-is.
  if (node.nodeType === Node.TEXT_NODE) return node

  if (node.nodeType !== Node.ELEMENT_NODE) return null

  if (!ALLOWED_TAGS.has(node.tagName)) {
    // Not an allowed tag: drop the tag but keep its text content,
    // so we don't lose the actual description text.
    const fragment = document.createDocumentFragment()
    Array.from(node.childNodes).forEach((child) => {
      const cleaned = cleanNode(child)
      if (cleaned) fragment.appendChild(cleaned)
    })
    return fragment
  }

  const clean = document.createElement(node.tagName)
  const allowedAttrs = ALLOWED_ATTRS[node.tagName]

  if (allowedAttrs) {
    for (const attr of node.attributes) {
      if (!allowedAttrs.has(attr.name)) continue
      if (attr.name === "href" && !isSafeUrl(attr.value)) continue
      clean.setAttribute(attr.name, attr.value)
    }
  }

  if (node.tagName === "A") {
    // Always force safe link behavior regardless of source attributes.
    clean.setAttribute("target", "_blank")
    clean.setAttribute("rel", "noopener noreferrer nofollow")
  }

  Array.from(node.childNodes).forEach((child) => {
    const cleaned = cleanNode(child)
    if (cleaned) clean.appendChild(cleaned)
  })

  return clean
}

export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml) return ""

  const parsed = new DOMParser().parseFromString(dirtyHtml, "text/html")
  const container = document.createElement("div")

  Array.from(parsed.body.childNodes).forEach((child) => {
    const cleaned = cleanNode(child)
    if (cleaned) container.appendChild(cleaned)
  })

  return container.innerHTML
}