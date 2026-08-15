# Symulator Jaipur — scenariusze testowe

Pełna lista scenariuszy przygotowanych i przetestowanych podczas rozwoju symulatora ([public/game.js](public/game.js)). Dokument obejmuje zarówno wersję bazową (2 graczy), jak i wariant 4-graczowy (1 gracz + 3 boty) — patrz [GAME_RULES.md](GAME_RULES.md) po pełny opis zasad i wykrytych błędów.

Legenda statusu: ✅ przetestowano i działa poprawnie · 🛠️ scenariusz ujawnił błąd, który naprawiono i ponownie zweryfikowano.

## 1. Akcja: Weź kartę z rynku

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 1 | Wzięcie 1 karty towaru z rynku | Karta trafia do ręki, rynek uzupełniany z talii | ✅ |
| 2 | Próba wzięcia wielbłąda tą akcją | Błąd: "Wielbłądy bierze się osobną akcją" | ✅ |
| 3 | Wzięcie karty przy ręce = 7 (pełna) | Błąd: ręka pełna, akcja zablokowana | ✅ |
| 4 | Wzięcie karty przy ręce = 6 → 7 | Dozwolone, ręka osiąga limit | ✅ |
| 7(4p) | Limit ręki egzekwowany dla dowolnego gracza (np. Bota 3, index 3), nie tylko człowieka | Błąd identyczny jak dla gracza-człowieka | ✅ |

## 2. Akcja: Weź wszystkie wielbłądy

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 5 | Wzięcie wszystkich wielbłądów z rynku | Trafiają do stada, nie liczą się do limitu ręki | ✅ |
| 6 | Próba wzięcia, gdy brak wielbłądów na rynku | Błąd: "Na rynku nie ma wielbłądów" | ✅ |

## 3. Akcja: Sprzedaż

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 7 | Sprzedaż 1 karty towaru pospolitego | Dozwolone, punkty z wierzchu stosu żetonów | ✅ |
| 8 | Sprzedaż 1 karty towaru rzadkiego (diamenty/złoto/srebro) | Błąd: rzadkie wymagają min. 2 kart naraz | ✅ |
| 9 | Sprzedaż 2+ kart towaru rzadkiego | Dozwolone | ✅ |
| 10 | Sprzedaż 3 kart naraz | Punkty + żeton bonusowy z puli "3" | ✅ |
| 11 | Sprzedaż 4 kart naraz | Punkty + żeton bonusowy z puli "4" | ✅ |
| 12 | Sprzedaż 5+ kart naraz | Punkty + żeton bonusowy z puli "5+" | ✅ |
| 13 | Sprzedaż, gdy pula żetonów bonusowych już pusta | Punkty za towar bez bonusu, brak błędu | ✅ |
| 14 | Sprzedaż większej liczby kart niż zostało w puli żetonów towaru | Wypłata tylko tylu żetonów, ile zostało w puli (częściowa wypłata) | ✅ |
| 15 | Próba sprzedaży więcej kart niż posiadasz w ręce | Błąd walidacji | ✅ |
| 16 | Zaznaczenie kart różnych towarów i próba sprzedaży | Błąd: "muszą być tym samym towarem" (zweryfikowane realnym klikaniem w UI) | ✅ |
| 39 | 🛠️ Sprzedaż towaru, którego pula żetonów jest już całkowicie pusta | Powinno być zablokowane, a nie sprzedawać za 0 pkt | 🛠️ naprawiono (błąd B2) |
| 8(4p) | Blokada sprzedaży 1 karty rzadkiej dla dowolnego bota (index 3) | Błąd identyczny jak dla gracza | ✅ |
| 12(4p) | Poprawna odmiana czasownika w logu ("sprzedaje" dla bota, "sprzedajesz" dla gracza) | Log gramatycznie poprawny dla obu stron | ✅ |

## 4. Akcja: Wymiana

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 17 | Wymiana 2 kart z ręki na 2 karty z rynku | Dozwolone, karty trafiają na wymienione miejsca | ✅ |
| 18 | Wymiana z użyciem wielbłądów ze stada jako "zapłaty" | Wielbłądy znikają ze stada, trafiają na rynek jako zwykłe karty | ✅ |
| 19 | Próba wzięcia wielbłąda z rynku przez wymianę | Błąd: trzeba użyć akcji "Weź wszystkie wielbłądy" | ✅ |
| 20 | Niezgodna liczba oddawanych i branych kart | Błąd walidacji | ✅ |
| 21 | Próba wymiany z <2 kartami/wielbłądami łącznie | Błąd: min. 2 karty/wielbłądy | ✅ |
| 40 | 🛠️ Wymiana samymi wielbłądami prowadząca do przekroczenia limitu 7 kart w ręce | Powinno być zablokowane | 🛠️ naprawiono (błąd B1) |
| 6(4p) | Wymiana maksymalna: 7 kart z ręki za cały powiększony rynek (7 kart) naraz | Dozwolone, poprawna wymiana wszystkich slotów rynku | ✅ |

## 5. Koniec gry i wynik

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 22 | 3 z 6 stosów żetonów towarów puste | Gra kończy się natychmiast po akcji | ✅ |
| 23 | Talia kart się wyczerpuje | Gra kończy się | ✅ |
| 24 | Gracz ma więcej wielbłądów niż przeciwnik(-cy) | +5 pkt bonus (Pieczęć Doskonałości) | ✅ |
| 25 | Bot ma więcej wielbłądów niż gracz | +5 pkt dla bota | ✅ |
| 26 | Remis w liczbie wielbłądów (2 graczy) | Brak bonusu dla nikogo | ✅ |
| 27 | Wynik końcowy: gracz > pozostali | Komunikat wskazujący zwycięzcę | ✅ |
| 28 | Wynik końcowy: bot > gracz | Komunikat wskazujący bota jako zwycięzcę | ✅ |
| 29 | Wynik końcowy: remis punktowy | Komunikat "Remis." | ✅ |
| 2(4p) | 4 graczy z 0 wielbłądów jednocześnie | Brak bonusu za Pieczęć Doskonałości (maxCamels=0) | ✅ |
| 3(4p) | Unikalny lider z zaledwie 1 wielbłądem (reszta ma 0) | Wciąż dostaje +5 pkt — liczy się względna przewaga, nie liczba bezwzględna | ✅ |
| 4(4p) | Sprzedaż bota kończąca grę w trakcie jego własnej tury (3. pusty stos) | `gameOver` ustawiane poprawnie w trakcie tury bota, nie tylko gracza | ✅ |
| 5(4p) | Wynik końcowy poprawnie wskazuje zwycięzcę spośród 4 graczy | Zwycięzca z najwyższym wynikiem wskazany poprawnie | ✅ |
| — (4p) | Remis punktowy obejmujący 3 z 4 graczy jednocześnie | Komunikat "Remis między: [lista graczy]" | ✅ |
| — (4p) | Remis liderów wielbłądów (2+ graczy z tą samą, najwyższą liczbą) | Brak bonusu dla nikogo | ✅ |

## 6. Bot AI (heurystyka)

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 30 | Bot sprzedaje towar rzadki o wysokiej wartości | Log tłumaczy wybór ("najlepsza opcja") | ✅ |
| 31 | Bot bierze wielbłądy, gdy jest ich ≥2 na rynku | Log: "warto je zgarnąć do stada" | ✅ |
| 32 | Bot bierze pojedynczą kartę, preferując towar rzadki | Log: "rozsądna opcja" | ✅ |
| 33 | Bot ma pełną rękę (7) i musi zdecydować inaczej | Bierze wielbłądy zamiast brać kartę (branża "pełna ręka") | ✅ |
| 34 | Bot nie ma żadnego korzystnego ruchu (rzadki przypadek) | Fallback: wymiana najsłabszych kart z rynkiem | ✅ |
| 41 | Ryzyko podwójnego kliknięcia tego samego przycisku akcji | Niskie ryzyko — JS jednowątkowy, synchroniczny cykl klik→render | ℹ️ ocena kodu |

## 7. Interfejs użytkownika (UI)

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 35 | Kliknięcie akcji poza swoją turą | Przyciski zablokowane + baner błędu "Poczekaj na swoją turę" | ✅ |
| 36 | Kliknięcie akcji po zakończeniu gry | Baner błędu "Gra zakończona" | ✅ |
| 37 | Wybór wielbłądów do wymiany powyżej posiadanej liczby | Przycisk "+" blokuje się na maksimum | ✅ |
| 38 | "Nowa gra" w trakcie rozgrywki | Pełny reset stanu, logu i zaznaczeń | ✅ |
| — | Baner błędu zamiast blokującego `alert()` | Komunikat nieblokujący, strona nie zawiesza się | ✅ (naprawiono błąd B3) |

## 8. Scenariusze specyficzne dla wariantu 4-graczowego

| # | Scenariusz | Oczekiwane zachowanie | Status |
|---|---|---|---|
| 1(4p) | Rotacja tur: Ty → Bot 1 → Bot 2 → Bot 3 → Ty | Kolejność zachowana dokładnie w tej sekwencji | ✅ |
| 6(4p) | Rozmiar talii (92 karty) i rynku (7 kart) zgodny z projektem wariantu 4-graczowego | Suma kart w talii + rynku + rękach + stadach = 92 | ✅ |
| B5 | 🛠️ **Race condition**: reset gry ("Nowa gra") w trakcie oczekującego `setTimeout` z łańcucha ruchów botów | Przeterminowany krok bota nie powinien wykonać się na nowym stanie gry ani "przejąć" tury gracza-człowieka | 🛠️ naprawiono — odtworzone w realnej przeglądarce, potwierdzone jako błąd (log pokazywał "Ty sprzedajesz..." bez udziału gracza), naprawione przez porównanie referencji obiektu stanu (`state !== gameRef`) |
| — (4p) | Normalna (bez resetu) sekwencja 3 automatycznych ruchów botów po akcji gracza | Nadal działa poprawnie po poprawce B5 — brak regresji | ✅ |

---

## Podsumowanie liczbowe

| Kategoria | Liczba scenariuszy | Wynik |
|---|---|---|
| Weź kartę | 5 | ✅ 5/5 |
| Wielbłądy | 2 | ✅ 2/2 |
| Sprzedaż | 13 | ✅ 12/13 + 1 🛠️ |
| Wymiana | 7 | ✅ 6/7 + 1 🛠️ |
| Koniec gry / wynik | 14 | ✅ 14/14 |
| Bot AI | 6 | ✅ 5/6 + 1 ocena kodu |
| UI | 5 | ✅ 5/5 |
| Specyficzne dla 4 graczy | 4 | ✅ 3/4 + 1 🛠️ |
| **Razem** | **56** | **53 ✅ / 3 🛠️ naprawione podczas testów** |

Wszystkie błędy oznaczone 🛠️ (B1, B2, B3, B4, B5 — pełny opis w [GAME_RULES.md](GAME_RULES.md), sekcja 4) zostały naprawione w kodzie i ponownie zweryfikowane po poprawce, żeby potwierdzić brak regresji.
