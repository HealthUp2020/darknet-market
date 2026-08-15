# Symulator Jaipur — decyzje dotyczące UI

Dokument zbiera decyzje projektowe dotyczące interfejsu użytkownika podjęte podczas tworzenia symulatora ([public/index.html](public/index.html), [public/style.css](public/style.css), [public/game.js](public/game.js)) — zarówno już zaimplementowane, jak i ustalone kierunki na przyszłość. Zasady samej gry opisuje [GAME_RULES.md](GAME_RULES.md), scenariusze testowe [TEST_SCENARIOS.md](TEST_SCENARIOS.md).

## 1. Wzorzec interakcji: zaznacz, potem wybierz akcję

**Decyzja:** gracz najpierw klika karty (na rynku i/lub w swojej ręce), które podświetlają się zielonym obramowaniem (`.card.selected`), a dopiero potem klika przycisk akcji (np. "Sprzedaj zaznaczone karty z ręki"), który operuje na aktualnym zaznaczeniu.

**Dlaczego:** jeden spójny mechanizm zaznaczania obsługuje wszystkie cztery akcje (weź kartę, sprzedaj, wymień) zamiast osobnych przepływów dla każdej z nich — mniej kliknięć, łatwiejsze do zrozumienia bez instrukcji.

**Szczegóły:**
- Zaznaczenie przechowywane w dwóch zbiorach: `selectedMarket` (indeksy kart na rynku) i `selectedHand` (indeksy kart w ręce gracza).
- Kliknięcie ponownie w zaznaczoną kartę odznacza ją (toggle).
- Zaznaczenie czyści się automatycznie po każdej wykonanej akcji oraz po "Nowej grze".

## 2. Wielbłądy do wymiany: osobny licznik +/− zamiast zaznaczania kart

**Decyzja:** wielbłądy w stadzie gracza nie są renderowane jako klikalne karty (bo nie są kartami w ręce) — zamiast tego obok "Twojej ręki" jest licznik z przyciskami "−" / "+", którym gracz wybiera, ile wielbłądów dołączyć do wymiany.

**Dlaczego:** wielbłądy strukturalnie różnią się od kart towarów (nie mają indeksu w ręce, nie mają koloru/typu do pokazania jako "karta") — wymuszanie ich w tę samą listę zaznaczalnych kart wprowadzałoby niespójność. Osobny licznik jasno komunikuje "to jest zasób, nie karta".

**Szczegóły:**
- Przycisk "+" blokuje się (`disabled`), gdy licznik osiągnie liczbę wielbłądów posiadanych przez gracza.
- Przycisk "−" blokuje się przy 0.
- Licznik resetuje się do 0 po każdej akcji i po "Nowej grze".

## 3. Komunikaty błędów: baner nieblokujący zamiast `alert()`

**Decyzja:** wszystkie błędy walidacji (np. "Zaznacz dokładnie 1 kartę z rynku", "Poczekaj na swoją turę") wyświetlane są jako baner w interfejsie (`#error-banner`), a nie przez natywne okno `alert()`.

**Dlaczego:** `alert()` jest **blokujący** — zawiesza całą stronę (i całe wykonanie JS) do czasu ręcznego zamknięcia okna przez użytkownika. To zły UX przy normalnej grze (zbędny dodatkowy klik przy każdym błędzie) i okazało się też realnym problemem podczas testowania — zawieszało automatyzację przeglądarki. Wykryte podczas testów w tej samej sesji, w której baner został wprowadzony (patrz [GAME_RULES.md](GAME_RULES.md), błąd B3).

**Szczegóły:**
- `showError(msg)` ustawia tekst i odkrywa baner (`hidden = false`).
- `clearError()` chowa baner przy każdej udanej akcji i przy "Nowej grze".
- Baner ma wyraźny czerwonawy kolor tła (`#4a2323`) odróżniający go od reszty ciemnego motywu.

## 4. Panele botów: podgląd skrócony, nie pełna ręka

**Decyzja:** dla każdego bota (Bot 1/2/3) w wariancie 4-graczowym pokazywana jest tylko liczba kart w ręce, liczba wielbłądów i wynik punktowy — nie same karty. Pełna ręka (z podziałem na konkretne karty do kliknięcia) jest widoczna wyłącznie dla gracza-człowieka.

**Dlaczego:** to odzwierciedla rzeczywiste zasady gry — gracze nie widzą kart przeciwników, tylko liczbę kart w ręce. Pokazanie pełnych rąk botów ułatwiłoby "podglądanie" i zepsułoby sens grania.

**Szczegóły:**
- Panele botów generowane dynamicznie w JS (`#bots-container`) w jednym wierszu (`.bots-row`, flex-wrap) zamiast osobnych sekcji HTML dla każdego — łatwiej utrzymać przy ewentualnej zmianie liczby botów.
- Panel aktywnie grającego bota podświetlony klasą `.active-turn` (zielona ramka) plus dopisek "(tura)" w nagłówku.

## 5. Wskaźnik tury

**Decyzja:** osobny, zawsze widoczny na górze strony komunikat tekstowy (`#turn-indicator`) informujący, czyja jest teraz tura ("Twoja tura." / "Tura: Bot 2..." / "Gra zakończona.").

**Dlaczego:** przy 4 graczach i automatycznych ruchach botów w tle łatwo stracić orientację, kto teraz gra — szczególnie że przyciski akcji są wtedy zablokowane, ale bez wyraźnego komunikatu niejasne byłoby, dlaczego.

## 6. Tempo automatycznych ruchów botów: opóźnienie 400ms między turami

**Decyzja:** po ruchu gracza trzy tury botów rozgrywają się automatycznie jedna po drugiej, ale z ok. 400ms przerwą między nimi (`setTimeout` w `stepBotsIfNeeded`), a nie natychmiastowo w pętli.

**Dlaczego:** natychmiastowe rozegranie 3 ruchów botów w jednej klatce renderowania byłoby nieczytelne — gracz nie zdążyłby przeczytać logu tłumaczącego kolejne decyzje. Opóźnienie daje wrażenie "rozgrywki", a nie skoku stanu.

**Znany kompromis:** ten mechanizm oparty o `setTimeout` był źródłem błędu wyścigu (race condition) przy resecie gry w trakcie oczekującego ruchu bota — opisanego i naprawionego jako błąd B5 w [GAME_RULES.md](GAME_RULES.md). Naprawa polega na porównaniu referencji obiektu stanu gry, nie na zmianie samego podejścia z opóźnieniem.

## 7. Blokowanie przycisków akcji jako pierwsza linia obrony (nie tylko walidacja w funkcji)

**Decyzja:** przyciski akcji (`#actions button`, poza "Nowa gra") są fizycznie blokowane (`disabled`), gdy nie jest tura gracza-człowieka lub gra się zakończyła — **oprócz** tego, że funkcje logiki gry i tak walidują to samo (`requirePlayerTurn()`).

**Dlaczego:** podwójna warstwa — przeglądarka nie pozwala nawet kliknąć disabled przycisku (lepszy UX, brak zbędnych komunikatów błędu przy oczywistych sytuacjach), a walidacja w funkcji zostaje jako zabezpieczenie na wypadek wywołania spoza UI (np. z konsoli, tak jak podczas testów).

## 8. Motyw kolorystyczny: ciemny motyw z kolorami per typ towaru

**Decyzja (zaimplementowana):** całość w ciemnym motywie (`background: #1b1f24`), każdy typ towaru ma własny odcień tła karty (`.card.diamond`, `.card.gold` itd.), żeby towary były rozróżnialne "na pierwszy rzut oka" bez czytania etykiety.

## 9. Kierunek wizualny reskinu cyberpunkowego (ustalony, jeszcze niezaimplementowany)

**Decyzja:** docelowa stylistyka to mix Ghost in the Shell (chłodny tech-noir jako baza) i Cyberpunk 2077 (neonowe akcenty na rzadkich elementach) — wybrany świadomie zamiast czystej wersji jednego z tych stylów.

**Dlaczego:** czysty tech-noir (GITS) byłby zbyt stonowany i mniej wyrazisty wizualnie na dłuższą metę; czysty neon-maksymalizm (CP2077) zmęczyłby oko i utrudniał odróżnienie rzadkich towarów od pospolitych. Mix rozwiązuje to przez kontrast: neonowa poświata staje się wizualnym sygnałem "to jest rzadkie i wartościowe".

**Ustalona paleta:**

| Element | Kolor | Uwagi |
|---|---|---|
| Tło strony | `#0a0e16` (głęboka granatowa czerń) | baza tech-noir |
| Panele | `#141a24` z cienką ramką | baza tech-noir |
| Tekst podstawowy | chłodna biel/szarość | baza tech-noir |
| UI neutralne (przyciski, obramowania) | przygaszony cyjan `#4fc3d9` | baza tech-noir |
| Rdzenie AI (rzadki, odpowiednik diamentów) | intensywny elektryczny cyjan + poświata (`box-shadow`) | akcent neonowy |
| Nielegalne implanty (rzadki, odpowiednik złota) | neonowy żółty/złoty + poświata | akcent neonowy |
| Skradzione dane korporacyjne (rzadki, odpowiednik srebra) | neonowy róż/magenta + poświata | akcent neonowy |
| Kontrabanda farmaceutyczna (pospolity, odp. tkanin) | stonowany fiolet, bez poświaty | baza tech-noir |
| Crackowany software (pospolity, odp. przypraw) | zielony "terminal code", bez poświaty | baza tech-noir |
| Uliczne uzbrojenie (pospolity, odp. skór) | przygaszona czerwień/pomarańcz, bez poświaty | baza tech-noir |
| Drony kurierskie (odp. wielbłądów) | srebrno-biały z cyjanową obwódką | akcent neutralny |

**Status:** ✅ **ZAIMPLEMENTOWANO (Etap 1 / P0).** Reskin wdrożony w [public/style.css](public/style.css), [public/index.html](public/index.html) i [public/game.js](public/game.js) — cała warstwa tekstowa i kolorystyczna, plus dodatkowo:

- **Cały interfejs przetłumaczony na angielski** (nazwy towarów, log, przyciski, nagłówki). Nazwy: AI Cores, Implants, Corp Data, Pharma, Cracked SW, Weaponry, Drones; rynek → Darknet Market; stado → fleet; Pieczęć Doskonałości → Fixer Reputation; log → System Terminal. Tytuł: `NETRUNNER://BLACK_MARKET`.
- **Design system zrekonstruowany z mockupów Claude Design** (folder `ui-mockups`) — wspólny `styles.css` mockupów nie został wyeksportowany, więc tokeny (paleta, szkło, tekstury siatki/scanline, poświaty, kanciaste clip-path, animacje `ds-pulse`/`at-flow`) odtworzono w [public/style.css](public/style.css).
- **Komponenty:** holograficzny pasek tury (cyjan = gracz / magenta = bot / szary = koniec), szklane panele HUD z pulsującą ramką na aktywnej turze bota, kanciaste przyciski z hover-glow (reset jako akcja systemowa), czerwony baner błędu, terminalowy log z prefiksami `>`.
- **Ikony kart:** kompaktowe ikony SVG per towar (heksagonalny kryształ = AI Cores, oko-implant = Implants, warstwy danych = Corp Data, fiolka = Pharma, okno terminala = Cracked SW, pistolet = Weaponry, quadkopter = Drones) w mapie `ICONS` w [game.js](public/game.js), dziedziczące kolor akcentu przez `currentColor`. Rzadkie towary mają poświatę, pospolite są stonowane.

**Uwaga o zakresie:** to kompaktowe, grywalne destylaty mockupów — pełnowymiarowe ilustracje kart 380×532 (P1/P2 z [UI_ELEMENTS.md](UI_ELEMENTS.md)) mogą zostać dołożone później jako osobna warstwa. Zweryfikowano w przeglądarce: brak błędów konsoli, pełny przebieg rozgrywki działa (boty grają, logi po angielsku).

## 10. Reagowanie na zmianę stanu: pełny re-render zamiast update'ów cząstkowych

**Decyzja:** funkcja `render()` przy każdej zmianie stanu przebudowuje całość `innerHTML` odpowiednich kontenerów (rynek, ręka, panele botów, log) zamiast selektywnie aktualizować pojedyncze elementy DOM.

**Dlaczego:** przy tej skali gry (kilkanaście-kilkadziesiąt elementów) różnica wydajności jest nieodczuwalna, a pełny re-render eliminuje całą klasę błędów synchronizacji stanu z DOM (nie trzeba pamiętać, co dokładnie zmieniło się od ostatniego renderu). Prostota kodu wygrywa z mikrooptymalizacją.
