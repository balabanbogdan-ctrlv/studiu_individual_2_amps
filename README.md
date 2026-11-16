# Generator de albume foto

Aplicație web (HTML, Tailwind CSS prin CDN, JavaScript) pentru crearea unui album foto direct în browser.
Fotografiile nu sunt trimise nicăieri: rămân local, în memoria paginii.

## Funcționalități
- încărcare multiplă și drag & drop
- titlu și subtitlu pentru album, titlu pentru fiecare fotografie
- aspecte: Grilă, Mozaic, Polaroid; 2–5 coloane
- reordonare și ștergere
- vizualizare mare cu tastatura (← → Esc) și prezentare automată
- temă automată / luminoasă / întunecată
- tipărire sau salvare ca PDF

## Structură
```
index.html
js/app.js
```

## Rulare locală
Deschide `index.html` în browser (are nevoie de internet pentru Tailwind CDN și fonturi).

## Publicare pe GitHub Pages
1. Creează un repository și urcă fișierele în rădăcină.
2. Settings → Pages → Source: „Deploy from a branch”, branch `main`, folder `/ (root)`.
3. Site-ul apare la `https://<utilizator>.github.io/<repository>/`.

## Note
Tot stilul este făcut cu clase Tailwind (fără fișier CSS separat). Tailwind este încărcat prin CDN, potrivit pentru un proiect de studiu. Pentru producție se recomandă build-ul Tailwind CLI.