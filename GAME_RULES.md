# Symulator Jaipur — zasady gry i znane problemy

Dokument opisuje zasady gry zaimplementowane w symulatorze ([public/game.js](public/game.js)) oraz problemy wykryte podczas testów.

> **Uwaga:** symulator działa obecnie w **wariancie 4-graczowym** (1 gracz + 3 boty), autorsko zaadaptowanym z oryginalnej, ściśle 2-osobowej gry Jaipur. Sekcja 0 opisuje, co dokładnie zmieniono względem oryginału i dlaczego.

## 0. Wariant 4-graczowy — co zmieniono względem oryginału

Oryginalny Jaipur jest zaprojektowany wyłącznie na 2 graczy — nie istnieją oficjalne zasady na więcej osób. Poniższe zmiany to autorska adaptacja (tryb "każdy na własną rękę", bez drużyn), zaprojektowana wspólnie z użytkownikiem:

| Parametr | Oryginał (2 graczy) | Wariant 4-graczowy | Powód zmiany |
|---|---|---|---|
| Liczba graczy | 2 | 4 (1 człowiek + 3 boty) | Wymaganie użytkownika |
| Rozmiar rynku | 5 kart | **7 kart** | Mniejszy "zator" o karty przy 4 graczach rywalizujących o ten sam rynek |
| Rozmiar talii | 55 kart | **92 karty** (~1.7x) | Żeby talia i stosy żetonów starczyły na rozgrywkę z 4 sprzedającymi, a nie kończyły się po kilku turach |
| Stosy żetonów towarów | 5–9 żetonów na stos | **7–13 żetonów na stos** (patrz sekcja 1) | To samo — dłuższa rozgrywka bez przedwczesnego triggera końca gry |
| Pule żetonów bonusowych (3/4/5+) | 6, 6, 5 żetonów | **8, 8, 7 żetonów** | Więcej graczy = więcej okazji do sprzedaży 3+ kart naraz |
| Bonus za wielbłądy (Pieczęć Doskonałości) | +5 pkt dla lidera, remis = brak | **bez zmian**: +5 pkt tylko dla unikalnego lidera spośród 4 graczy, remis (także wieloosobowy) = brak bonusu | Świadomy wybór: prostota zamiast np. dodatkowego bonusu za 2. miejsce |
| Limit ręki | 7 kart | **bez zmian — 7 kart** | To ograniczenie osobiste gracza, nie zależy od liczby uczestników |
| Kolejność tur | Naprzemiennie 2 graczy | **Rotacja 4 graczy**: Ty → Bot 1 → Bot 2 → Bot 3 → Ty... | Naturalne rozszerzenie |
| Akcja wymiany | Zawsze z rynkiem (nie z ręką przeciwnika) | **bez zmian** | Wymiana w Jaipur nigdy nie była interakcją 1:1 z przeciwnikiem, więc skaluje się bez modyfikacji |

## 1. Komponenty gry (wariant 4-graczowy)

### Talia kart towarów (92 karty)

| Towar | Liczba kart | Typ |
|---|---|---|
| Diamenty | 10 | rzadki |
| Złoto | 10 | rzadki |
| Srebro | 10 | rzadki |
| Tkaniny | 14 | pospolity |
| Przyprawy | 14 | pospolity |
| Skóry | 16 | pospolity |
| Wielbłądy | 18 | specjalny |

Towary **rzadkie** (diamenty, złoto, srebro) można sprzedawać wyłącznie w grupach **min. 2 kart naraz**. Towary pospolite można sprzedawać pojedynczo.

### Żetony wartości towarów (malejące)

| Towar | Wartości żetonów (od pierwszego do ostatniego branego) |
|---|---|
| Diamenty | 7, 7, 7, 5, 5, 5, 5 |
| Złoto | 6, 6, 6, 5, 5, 5, 5 |
| Srebro | 5, 5, 5, 5, 5, 5, 5 |
| Tkaniny | 5, 5, 3, 3, 3, 2, 2, 2, 1, 1 |
| Przyprawy | 5, 5, 3, 3, 3, 2, 2, 2, 1, 1 |
| Skóry | 4, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1 |

Sprzedając N kart danego towaru, gracz otrzymuje N kolejnych (malejących) żetonów z wierzchu stosu tego towaru — o ile tyle zostało w stosie (patrz punkt 5, sekcja o niedoborze żetonów).

### Żetony bonusowe za sprzedaż wielu kart naraz

| Liczba sprzedanych kart | Pula żetonów bonusowych | Przykładowe wartości |
|---|---|---|
| 3 | Pula "3" | 1, 1, 1, 2, 2, 2, 3, 3 (potasowane) |
| 4 | Pula "4" | 4, 4, 4, 5, 5, 6, 6, 6 (potasowane) |
| 5 lub więcej | Pula "5+" | 8, 8, 9, 9, 10, 10, 10 (potasowane) |

Żeton bonusowy przyznawany jest **niezależnie od tego, ile żetonów towaru faktycznie otrzymano** — liczy się liczba sprzedanych kart, nie liczba wypłaconych żetonów.

### Bonus za wielbłądy (Pieczęć Doskonałości)

Na koniec gry gracz z **największą liczbą wielbłądów w stadzie spośród wszystkich 4 graczy** otrzymuje +5 pkt. Przy remisie (dwóch lub więcej graczy z tą samą, najwyższą liczbą wielbłądów) bonus nie jest przyznawany nikomu.

## 2. Przebieg gry

- Rozdanie: każdy z 4 graczy otrzymuje 5 kart towarów (wielbłądy trafiające się przy rozdaniu trafiają od razu do stada, nie liczą się do ręki), rynek ma 7 kart.
- Limit ręki: **7 kart towarów** (wielbłądy w stadzie nie liczą się do tego limitu).
- Gracze wykonują tury w kolejności Ty → Bot 1 → Bot 2 → Bot 3 → Ty..., w każdej turze dokładnie jedna akcja:

### Akcja: Weź 1 kartę z rynku
- Dozwolone tylko dla towarów (nie dla wielbłąda).
- Zabroniona, jeśli ręka ma już 7 kart.
- Rynek uzupełniany jest 1 kartą z talii.

### Akcja: Weź wszystkie wielbłądy
- Zabiera **wszystkie** wielbłądy obecne na rynku naraz (nie da się wziąć części).
- Wielbłądy trafiają do stada gracza, nie do ręki.
- Rynek uzupełniany jest talią o tyle kart, ile wielbłądów zabrano.
- Zabroniona, jeśli na rynku nie ma żadnego wielbłąda.

### Akcja: Sprzedaż
- Gracz oddaje N kart tego samego towaru z ręki.
- Towary rzadkie (diamenty/złoto/srebro): N ≥ 2.
- Towary pospolite: N ≥ 1.
- Gracz otrzymuje punkty równe sumie N kolejnych żetonów z wierzchu stosu danego towaru.
- Przy N ≥ 3 gracz dodatkowo otrzymuje żeton bonusowy z odpowiedniej puli (3/4/5+).

### Akcja: Wymiana
- Gracz oddaje min. 2 elementy (karty z ręki i/lub wielbłądy ze stada) w zamian za tyle samo kart z rynku.
- Liczba oddawanych i branych elementów musi być równa.
- Nie można w ten sposób wziąć wielbłąda z rynku (do tego służy osobna akcja).
- Oddane wielbłądy trafiają na rynek jako zwykłe karty do wzięcia przez przeciwnika.

## 3. Koniec gry i wynik

Gra kończy się natychmiast, gdy:
- **3 z 6 stosów żetonów towarów** są puste, **lub**
- talia kart się wyczerpie.

Wynik końcowy = suma punktów ze sprzedaży + żetony bonusowe + bonus za wielbłądy (jeśli dotyczy). Wygrywa gracz z najwyższym wynikiem spośród wszystkich 4; przy dwóch lub więcej graczach z tym samym, najwyższym wynikiem — remis (może obejmować 2, 3 lub 4 graczy naraz).

---

## 4. Wykryte i naprawione problemy

| ID | Problem | Skutek | Status |
|---|---|---|---|
| B1 | `exchangeCards` nie sprawdzała limitu ręki (7 kart) po wymianie | Oddając same wielbłądy (0 kart z ręki) za karty z rynku, można było ominąć limit ręki i mieć w ręce więcej niż 7 kart towarów | ✅ Naprawione — dodana walidacja `handSizeAfter > HAND_LIMIT` w [game.js](public/game.js:182) |
| B2 | `sellCards` pozwalała "sprzedać" towar, którego stos żetonów jest już całkowicie pusty | Gracz mógł oddać karty z ręki i otrzymać 0 punktów zamiast dostać informację, że taka sprzedaż nie ma sensu / powinna być zablokowana | ✅ Naprawione — blokada, gdy `state.tokens[good].length === 0` w [game.js](public/game.js:153) |
| B3 | Wszystkie błędy walidacji używały blokującego `alert()` | `alert()` zawiesza całą stronę (i automatyzację przeglądarki) do czasu ręcznego zamknięcia okna — zły UX przy normalnej grze | ✅ Naprawione — zastąpione nieblokującym banerem błędu w interfejsie ([game.js](public/game.js), `showError`/`clearError`) |
| B4 | Rozdanie początkowe wkładało kartę wielbłąda bezpośrednio do ręki gracza | Niezgodne z zasadami — wielbłądy nigdy nie powinny znaleźć się w ręce, tylko w stadzie | ✅ Naprawione — funkcja `dealGoodsHand()` w [game.js](public/game.js:100) automatycznie przenosi wylosowane wielbłądy do stada podczas rozdania |
| B5 | **Race condition** w łańcuchu automatycznych ruchów botów (wariant 4-graczowy): jeśli gracz kliknął "Nowa gra" w trakcie oczekującego `setTimeout` z sekwencji ruchów botów, przeterminowany callback wykonywał się na nowym stanie gry i — ponieważ czytał `state.turnIndex` już po resecie (turnIndex=0, tura gracza) — **automatycznie rozgrywał turę za gracza-człowieka** bez jego udziału | Po resecie do logu trafiał obcy wpis typu "Ty sprzedajesz..." mimo braku jakiejkolwiek akcji gracza — realna utrata kontroli nad własną turą | ✅ Naprawione — `stepBotsIfNeeded()` w [game.js](public/game.js:456) przyjmuje teraz referencję do konkretnego obiektu stanu gry (`gameRef`) i porównuje ją (`state !== gameRef`) przy każdym odpaleniu `setTimeout`; przeterminowane wywołania z poprzedniej partii są po cichu porzucane |

## 5. Znane ograniczenia strategii bota (nie są błędami reguł)

Bot gra zgodnie z zasadami, ale jego heurystyka decyzyjna w `botPlay()` ([game.js](public/game.js:230)) nie jest optymalna:

| Ograniczenie | Opis |
|---|---|
| Zbyt wczesna sprzedaż towarów rzadkich | Próg `value >= 6` w warunku sprzedaży jest na tyle niski, że para diamentów/złota niemal zawsze go przekracza — bot sprzedaje od razu 2 karty zamiast poczekać na 3+ i zgarnąć dodatkowy żeton bonusowy (który często jest wart więcej niż różnica w wycenie żetonów towaru) |
| Brak strategii gromadzenia wielbłądów | Bot bierze wielbłądy tylko reaktywnie (gdy jest ich ≥2 na rynku lub gdy ręka jest pełna), nigdy nie planuje przewagi w stadzie pod kątem bonusu +5 pkt na koniec gry |
| Wymiana bota nigdy nie wykorzystuje wielbłądów ze stada | W przeciwieństwie do gracza (funkcja dodana w tej sesji), bot w akcji wymiany zawsze przekazuje `camels: 0` — nie korzysta z tej samej przewagi strategicznej, którą ma gracz |
| Wymuszona sprzedaż przy niemal pełnej ręce | Warunek `hand.length >= 6` wymusza sprzedaż nawet słabo wycenionego towaru zamiast rozważenia wymiany nadmiarowych kart na lepsze |
| Brak świadomości fazy końcowej gry | Bot nie sprawdza, ile stosów żetonów jest już puste ani ile kart zostało w talii — nie przyspiesza ani nie spowalnia końca gry w zależności od tego, czy prowadzi, czy przegrywa |
| Wybór pojedynczej karty ignoruje kontekst | Bot wybiera kartę z rynku tylko na podstawie tego, czy towar jest rzadki — nie uwzględnia posiadanych już kart tego typu ani tego, ile żetonów zostało w stosie danego towaru |

## 6. Pokrycie testami

Wszystkie reguły z sekcji 1–3 oraz problemy z sekcji 4 zostały zweryfikowane w formie testów funkcjonalnych (bezpośrednie wywołania `takeCard`, `takeCamels`, `sellCards`, `exchangeCards`, `checkGameEnd`, `finishGame`, `botPlay`) oraz testów UI (kliknięcia w przeglądarce) — łącznie 40 scenariuszy dla wersji 2-graczowej, wszystkie zakończone wynikiem pozytywnym po wprowadzeniu poprawek B1–B4.

Po przepisaniu silnika na wariant 4-graczowy (sekcja 0) dodatkowo zweryfikowano:

| Scenariusz | Wynik |
|---|---|
| Unikalny lider wielbłądów wśród 4 graczy dostaje +5 pkt | ✅ |
| Remis liderów wielbłądów (2+ graczy) → brak bonusu | ✅ |
| Wynik końcowy poprawnie wskazuje zwycięzcę spośród 4 graczy | ✅ |
| Remis punktowy obejmujący 3 z 4 graczy poprawnie zgłoszony | ✅ |
| Rotacja tur: Ty → Bot 1 → Bot 2 → Bot 3 → Ty | ✅ |
| Rozmiar talii (92 karty) i rynku (7 kart) zgodny z projektem | ✅ |
| Regresja: limit ręki przy wymianie (B1) nadal działa po refaktorze | ✅ |
| Regresja: sprzedaż z pustej puli żetonów (B2) nadal zablokowana | ✅ |
| Regresja: sprzedaż 1 karty rzadkiej nadal zablokowana | ✅ |

Weryfikacja w przeglądarce potwierdziła też wizualnie: 3 panele botów z licznikiem kart/wielbłądów/punktów, wskaźnik aktywnej tury, automatyczne rozegranie 3 kolejnych tur botów po ruchu gracza, brak błędów w konsoli.

### Druga runda testów (scenariusze specyficzne dla 4 graczy)

| Scenariusz | Wynik |
|---|---|
| 4 graczy z 0 wielbłądów → brak bonusu za Pieczęć Doskonałości | ✅ |
| Unikalny lider z zaledwie 1 wielbłądem (reszta 0) wciąż dostaje +5 pkt | ✅ |
| Sprzedaż bota kończąca grę w trakcie jego własnej tury (3. pusty stos) poprawnie ustawia `gameOver` | ✅ |
| Wymiana maksymalna: 7 kart z ręki za cały rynek (7 kart) naraz | ✅ |
| Limit ręki (7 kart) egzekwowany też dla Bota 3 (index 3), nie tylko gracza | ✅ |
| Blokada sprzedaży 1 karty rzadkiej dla Bota 3 | ✅ |
| Odmiana czasowników w logu poprawna dla Bota 3 (3 os. l.poj.) | ✅ |
| **Race condition B5** (reset gry w trakcie łańcucha `setTimeout` botów) — odtworzony w realnej przeglądarce, potwierdzony jako błąd, naprawiony i zweryfikowany ponownie | ✅ naprawiono |
| Normalna (bez resetu) sekwencja 3 ruchów botów po akcji gracza nadal działa poprawnie po poprawce B5 | ✅ |

Błąd B5 jest szczególnie istotny, bo nie wychodził na jaw w testach jednostkowych na czystych funkcjach (`sellCards`, `exchangeCards` itd.) — ujawnił się dopiero przy odtworzeniu rzeczywistej sekwencji zdarzeń DOM (`click` → `setTimeout` → `click` w trakcie oczekiwania) w przeglądarce.
