# Symulator Jaipur (reskin cyberpunk) — lista elementów UI do zbudowania

Pełny inwentarz elementów wizualnych/UI potrzebnych do reskinu w stylistyce cyberpunk (mix Ghost in the Shell + Cyberpunk 2077 — patrz [UI_DECISIONS.md](UI_DECISIONS.md), sekcja 9). Lista podzielona na kategorie i priorytety, żeby dało się pracować etapami zamiast budować wszystko naraz.

## Priorytety

- **P0 — niezbędne do grywalnej wersji reskinu.** Bez tego gra nie działa wizualnie w nowej stylistyce.
- **P1 — istotne dla klimatu, ale gra działa bez nich (obecny placeholder wystarczy tymczasowo).**
- **P2 — polish/nice-to-have, dodać na końcu.**

## Status realizacji

**✅ Etap 1 (P0) — ZAIMPLEMENTOWANO** w [public/style.css](public/style.css), [public/index.html](public/index.html), [public/game.js](public/game.js), na podstawie mockupów z folderu `ui-mockups`. Cały interfejs jest po angielsku. Wdrożone jako komponenty grywalne (nie pełnowymiarowe assety):

- Żetony wartości (A) i bonusowe (B) → stylizowane `.token-pile` z kolorem akcentu per towar.
- Karty towarów (C) → `.card` w kanciastej ramce sci-fi z **ikoną SVG per towar** (mapa `ICONS` w `game.js`), poświatą na rzadkich, stonowane na pospolitych.
- Panele graczy/botów (D, poz. 23-25) → szklane panele HUD + pulsująca ramka aktywnej tury.
- HUD (F) → kanciaste przyciski z hover-glow, stepper dronów, baner błędu, terminalowy log, holograficzny pasek tury.

**⬜ Etap 2-3 (P1/P2)** — pozostają do zrobienia: pełnowymiarowe ilustracje kart 380×532, awatary graczy, tło sceny Night City, wizualizacja talii, animacje przejść/sprzedaży, ekran podsumowania końca gry. Można je dołożyć jako osobna warstwa na obecnym fundamencie.

---

## A. Żetony wartości towarów (6 wzorów + dynamiczna liczba) — P0

| # | Element | Uwagi |
|---|---|---|
| 1 | Żeton — **Rdzenie AI** (rzadki) | wartości: 7/7/7/5/5/5/5 — neonowy cyjan + poświata |
| 2 | Żeton — **Nielegalne implanty** (rzadki) | wartości: 6/6/6/5/5/5/5 — neonowy żółty/złoty + poświata |
| 3 | Żeton — **Skradzione dane korporacyjne** (rzadki) | wartości: 5×7 — neonowy róż/magenta + poświata |
| 4 | Żeton — **Kontrabanda farmaceutyczna** (pospolity) | wartości: 5/5/3/3/3/2/2/2/1/1 — stonowany fiolet |
| 5 | Żeton — **Crackowany software** (pospolity) | te same wartości co wyżej — zielony "terminal code" |
| 6 | Żeton — **Uliczne uzbrojenie** (pospolity) | wartości: 4/4/3/3/2/2/1×7 — przygaszona czerwień/pomarańcz |

## B. Żetony bonusowe — P0

| # | Element | Uwagi |
|---|---|---|
| 7 | Żeton bonusowy — sprzedaż 3 kart naraz | wizualnie odróżniony od żetonów wartości (inny kształt/obwódka) |
| 8 | Żeton bonusowy — sprzedaż 4 kart naraz | j.w. |
| 9 | Żeton bonusowy — sprzedaż 5+ kart naraz | j.w., najbardziej "cenny" wizualnie |
| 10 | Żeton specjalny — **"Reputacja u Fixera"** | jednorazowy, unikalny design — bonus za największą flotę dronów |

## C. Karty towarów (7 wzorów) — P0

| # | Element | Uwagi |
|---|---|---|
| 11 | Karta — Rdzenie AI | ikona + kolor zgodny z żetonem #1 |
| 12 | Karta — Nielegalne implanty | ikona + kolor zgodny z żetonem #2 |
| 13 | Karta — Skradzione dane korporacyjne | ikona + kolor zgodny z żetonem #3 |
| 14 | Karta — Kontrabanda farmaceutyczna | ikona + kolor zgodny z żetonem #4 |
| 15 | Karta — Crackowany software | ikona + kolor zgodny z żetonem #5 |
| 16 | Karta — Uliczne uzbrojenie | ikona + kolor zgodny z żetonem #6 |
| 17 | Karta — **Dron kurierski** (odpowiednik wielbłąda) | srebrno-biały z cyjanową obwódką |
| 18 | Rewers karty (tył) | P1 — potrzebny tylko jeśli dodamy wizualizację talii (patrz #28) |

## D. Gracze — P1

| # | Element | Uwagi |
|---|---|---|
| 19 | Awatar/portret — **Ty** (gracz) | P1 — obecnie wystarcza etykieta tekstowa "Ty" |
| 20 | Awatar/portret — **Bot 1** | P1 — unikalna postać/osobowość |
| 21 | Awatar/portret — **Bot 2** | P1 |
| 22 | Awatar/portret — **Bot 3** | P1 |
| 23 | Panel statystyk pełny (gracz): ręka + drony + punkty | P0 — już działa funkcjonalnie, potrzebuje tylko reskinu kolorystycznego |
| 24 | Panel statystyk skrócony (boty) | P0 — j.w. |
| 25 | Wskaźnik/podświetlenie aktywnej tury | P0 — już działa (`.active-turn`), potrzebuje reskinu |

## E. Plansza i rynek — P1/P2

| # | Element | Uwagi |
|---|---|---|
| 26 | Tło rozgrywki (scena "czarnego rynku" Night City) | P2 — czysto dekoracyjne |
| 27 | 7 slotów rynku (ramki na karty) | P1 — obecnie zwykłe div-y, warto dodać wizualne "gniazda" |
| 28 | Wizualizacja talii (stos zakrytych kart + licznik) | P2 — obecnie talia jest niewidoczna, tylko logika w tle |
| 29 | Układ stosów żetonów (6 towarowych + 3 bonusowe + 1 reputacji) | P1 — obecnie lista tekstowa, docelowo wizualne "stosy" |

## F. Elementy sterujące (HUD) — P0

| # | Element | Uwagi |
|---|---|---|
| 30 | Logo / tytuł gry | P1 — obecnie zwykły `<h1>` |
| 31 | Przycisk — "Weź 1 kartę z rynku" | P0 — reskin istniejącego przycisku |
| 32 | Przycisk — "Weź wszystkie drony" | P0 — reskin + zmiana nazwy z "wielbłądów" |
| 33 | Przycisk — "Sprzedaj zaznaczone" | P0 — reskin |
| 34 | Przycisk — "Wymień zaznaczone" | P0 — reskin |
| 35 | Przycisk — "Nowa gra" | P0 — reskin |
| 36 | Licznik +/− wyboru dronów do wymiany | P0 — reskin istniejącego elementu |
| 37 | Baner błędu/komunikatu systemowego | P0 — reskin (np. styl terminala/systemowego alertu) |
| 38 | Panel logu/historii akcji | P0 — reskin w stylu konsoli/terminala (pasuje tematycznie do cyberpunku "za darmo") |
| 39 | Wskaźnik tury (tekstowy) | P0 — reskin |

## G. Stany i mikro-animacje — P2

| # | Element | Uwagi |
|---|---|---|
| 40 | Stan zaznaczenia karty (glow/highlight) | P1 — już działa (`.card.selected`), można dodać animowaną poświatę |
| 41 | Stan hover/disabled przycisków | P1 — częściowo już działa, dopracować pod nowy motyw |
| 42 | Animacja przejścia karty z rynku do ręki | P2 |
| 43 | Animacja sprzedaży (karty znikają, punkty doliczane) | P2 |
| 44 | Ekran/panel podsumowania końca gry | P1 — obecnie tylko wpisy w logu, warto wydzielić czytelne podsumowanie |

---

## Sugerowana kolejność pracy

1. **Etap 1 (P0 — fundament reskinu):** żetony (A, B), karty towarów (C, poz. 11–17), reskin HUD (F) — to da grywalną, spójną wizualnie wersję cyberpunk bez zmiany funkcjonalności.
2. **Etap 2 (P1 — klimat):** awatary graczy (D), sloty rynku i stosy żetonów jako elementy wizualne (E, poz. 27/29), ekran podsumowania (G, poz. 44), logo.
3. **Etap 3 (P2 — polish):** tło sceny, wizualizacja talii, animacje przejść i sprzedaży.

Rekomendacja: zacząć od Etapu 1, przetestować w przeglądarce, dopiero potem przechodzić dalej — łatwiej ocenić, czy paleta i ikonografia "się bronią" na małym zestawie elementów, zanim zainwestujemy czas w P1/P2.
