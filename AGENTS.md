<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep imported page JSX and interactive quiz state in its route file; preserve the source classes and captured stylesheet to maintain visual fidelity.
- Store the source's literal quiz content in a browser-safe JSON module, separate from rendering, to preserve all original questions and answers.
- Preserve the imported quiz's optional browser-local score storage and hydrate it after mount so server rendering remains consistent.
- Apply the requested design refresh through scoped styles in the global design system while retaining the captured source stylesheet as reference; keep quiz behavior unchanged.
