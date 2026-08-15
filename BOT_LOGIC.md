# Symulator Jaipur — logika botów i zidentyfikowane problemy

Dokument opisuje aktualną logikę decyzyjną botów (`botPlay()` w [public/game.js](public/game.js)) oraz znane ograniczenia i kierunki dalszego rozwoju. Praca nad ulepszaniem botów jest **wstrzymana** — ten plik służy jako punkt zapisu stanu, żeby móc do niej wrócić bez ponownej analizy.

Powiązane dokumenty: zasady gry [GAME_RULES.md](GAME_RULES.md), decyzje UI [UI_DECISIONS.md](UI_DECISIONS.md), scenariusze testowe [TEST_SCENARIOS.md](TEST_SCENARIOS.md).

---

## 1. Aktualna logika botów (stan na moment wstrzymania)

Bot rozgrywa turę wybierając **pierwszą pasującą** opcję z poniższej listy priorytetów (kolejność `if ... return` w `botPlay()`). To heurystyka zachłanna: każdy bot optymalizuje tylko własną turę, bez planowania w przód i bez koordynacji z innymi botami.

### Priorytet 1 — Sprzedaż (z ochroną rzadkich towarów)

Bot ocenia trzy typy sprzedaży i wybiera pierwszy dostępny w tej kolejności:

1. **`bonusSell`** — dowolny komplet **3+ kart** tego samego towaru (daje żeton bonusowy). Zawsze warty zagrania. Spośród możliwych kompletów 3+ wybiera ten o najwyższej wartości.
2. **`bigCommonSell`** — komplet **towaru pospolitego** o rozmiarze ≥2 i wartości **≥8 pkt**. Towary pospolite mają niski sufit wartości, więc nie ma sensu ich trzymać — spieniężane od razu, gdy są warte dość dużo.
3. **`anySell`** (fallback) — najlepsza legalna sprzedaż, ale **tylko pod presją pełnej ręki** (`hand.length >= HAND_LIMIT - 1`, czyli 6+). Służy do zrobienia miejsca, gdy nic lepszego nie ma.

**Kluczowa własność:** pary rzadkich towarów (diamenty/złoto/srebro) **nie są** sprzedawane wcześnie — bot trzyma je do kompletu 3+, chyba że ręka jest niemal pełna. To był główny fix wprowadzony po obserwacji, że gracz zawsze wygrywał, wyprzedając rzadkie w kompletach 3-4, podczas gdy stare boty dumpowały pary za 2 i nigdy nie zgarniały żetonów bonusowych.

### Priorytet 2 — Weź wszystkie wielbłądy (reaktywnie)

Jeśli na rynku są **≥2 wielbłądy**, bot je zgarnia. Czysto reaktywne — brak strategii budowania przewagi pod bonus "Reputacja u Fixera" (+5 pkt na koniec gry).

### Priorytet 3 — Weź kartę (budowanie kompletów, priorytet rzadkich)

Jeśli ręka nie jest pełna (`hand.length < HAND_LIMIT`), bot wybiera kartę z rynku wg funkcji `scoreCard`:

```
score(c) = (rzadki ? 4 : 1)          // rzadkie znacznie cenniejsze
         + (mam już ten towar ? 2 : 0) // dokładanie do kompletu
         + (wartość następnego żetonu / 10)  // drobny tiebreak
```

Efekt: boty aktywnie konkurują z graczem o te same rzadkie karty i budują własne komplety pod żetony bonusowe (drugi fix wprowadzony razem z pierwszym).

### Priorytet 4 — Weź wielbłądy, gdy ręka pełna

Jeśli ręka pełna i na rynku jest choć jeden wielbłąd — bierze wielbłądy (nie mogąc wziąć karty towaru).

### Priorytet 5 — Wymiana (fallback)

Gdy nic z powyższego: bot wymienia do 2 swoich najmniej wartościowych kart (sortowanych tak, by oddawać pospolite przed rzadkimi) na karty z rynku. **Zawsze `camels: 0`** — bot nigdy nie używa wielbłądów ze stada jako waluty wymiany.

### Priorytet 6 — Pas (bardzo rzadki przypadek)

Gdy nie ma żadnego legalnego ruchu — bot pomija turę.

---

## 2. Historia zmian

| Zmiana | Opis | Efekt |
|---|---|---|
| Wersja pierwotna | Sprzedaż przy `value >= 6 \|\| count >= 3 \|\| hand.length >= 6`; branie karty sortowane tylko po "czy rzadki" | Gracz wygrywał z dużą przewagą — boty wyprzedawały pary rzadkich za bezcen i nie zgarniały żetonów bonusowych, nie konkurowały o rzadkie karty |
| Fix #1 — ochrona rzadkich | Rozdzielenie sprzedaży na `bonusSell` / `bigCommonSell` / `anySell` (pod presją ręki); rzadkie trzymane do kompletu 3+ | Boty zgarniają żetony bonusowe na rzadkich — odebrano graczowi wyłączną przewagę |
| Fix #2 — budowanie kompletów | `scoreCard` przy braniu karty: mocny priorytet rzadkich + dokładanie do własnych kompletów | Boty konkurują z graczem o te same rzadkie karty |

**Zweryfikowany efekt po fixach:** przewaga punktowa gracza znacząco zmalała (w testowej partii dwa boty wyszły na 20 i 10 pkt w pierwszej rundzie, gdy gracz miał 0), ale **gracz nadal wygrywa** — z mniejszą dominacją.

---

## 3. Zidentyfikowane problemy / ograniczenia (nienaprawione)

### Problem strukturalny (najważniejszy)

**1 planujący gracz vs 3 niezależne reaktywne boty.** Każdy bot zachłannie optymalizuje własną turę, ale żaden nie planuje w przód ani nie koordynuje działań, by zablokować lidera. Człowiek z sensowną, spójną strategią wygra z trzema zachłannymi reaktorami w większości partii — **niezależnie** od tego, jak dobrze każdy bot rozgrywa swoją pojedynczą decyzję. Dalsze dostrajanie heurystyk zmniejsza margines, ale nie odwróci wskaźnika zwycięstw.

### Pozostałe ograniczenia heurystyki

| # | Ograniczenie | Opis |
|---|---|---|
| P1 | Brak wyścigu o wielbłądy / Reputację u Fixera | Bot bierze wielbłądy tylko reaktywnie (≥2 na rynku lub pełna ręka), nigdy nie planuje przewagi w stadzie pod bonus +5 pkt na koniec gry |
| P2 | Brak świadomości fazy końcowej | Bot nie sprawdza, ile stosów żetonów jest bliskich wyczerpania ani ile kart zostało w talii — nie przyspiesza końca gry, gdy przegrywa, ani nie spowalnia, gdy prowadzi |
| P3 | Wymiana bota nie używa wielbłądów | W akcji wymiany bot zawsze przekazuje `camels: 0`, mimo że gracz ma tę możliwość — strukturalna przewaga gracza |
| P4 | Heurystyka lokalna, bez lookahead | Bot ocenia tylko bieżącą turę, nie symuluje kilku ruchów w przód ani reakcji rynku |

---

## 4. Kierunki dalszego rozwoju (do decyzji przy wznowieniu)

### Ścieżka A — dwa tanie levery heurystyczne (zachowuje czytelny log "Bot ocenia...")

- **Wyścig o wielbłądy / Reputację u Fixera (P1):** bot aktywnie zgarnia wielbłądy, gdy jest blisko prowadzenia w liczbie dronów/wielbłądów.
- **Świadomość końca gry (P2):** gdy bot przegrywa i 2 stosy żetonów są prawie puste — rusza trzeci, żeby zakończyć grę, zanim gracz spienięży duże komplety; gdy prowadzi — gra na zwłokę.

Efekt: partie stają się ciaśniejsze, sporadyczne porażki gracza, ale boty **nadal nie będą** konsekwentnie wygrywać.

### Ścieżka B — realnie konkurencyjny bot

- Zastąpienie zachłannej heurystyki lekkim **lookahead** (ocena każdego legalnego ruchu kilka ruchów w przód, albo prosty expectimax po rynku). Jedyna rzecz, która sprawi, że gracz zacznie regularnie przegrywać. Więcej pracy, log decyzji staje się mniej czytelny.

### Rekomendacja (z momentu wstrzymania)

- Cel "satysfakcjonujący tryb single-player" → **Ścieżka A** (gra wygrywana ~70% z realnym napięciem jest przyjemniejsza niż przegrywana z nieprzejrzystym AI).
- Cel "trudny przeciwnik" → **Ścieżka B**.

**Status:** decyzja o wyborze ścieżki nie została jeszcze podjęta — praca wstrzymana na życzenie użytkownika.

---

## Baseline measurement (ROC-205 · 2026-08-13) — *English; supersedes the "work paused" note above*

**Bot work has resumed.** The rules engine (incl. `botPlay`) now lives in `public/engine.js`
(pure, DOM-free). Balance is measured with a headless harness:

- `public/sim.js` — `playGame` / `simulate` (seedable, deterministic).
- `public/strategies.js` — `humanProxy`: models the human line Kasia reported (buy rares, hold
  for a 3–4 combo, sell a rare pair early, dump under hand pressure).
- Run: `bun scripts/simulate.ts [games] [seed]` (4 identical bots) and
  `bun scripts/baseline.ts [games] [seed]` (human-proxy vs 3 bots, rotated across all seats).

### Results (3000 games/seat, seed 1)

| Strategy (avg over all 4 seats) | Win % | Win % (incl. ties) | Avg score |
|---|---|---|---|
| human-proxy | **22.1%** | 25.2% | 49.2 |
| default bot | 23.6% | — | 48.6 |

Human-proxy win rate **by seat**: s0 30.1% · s1 22.9% · s2 19.0% · s3 16.4%. Fair share = 25%.

### Key findings (these change the tuning plan)

1. **Seat-order bias is the largest measurable imbalance** — the first mover wins ~30% and the
   last seat ~16% (~1.8×), for *both* identical bots (ROC-204) and the human-proxy. Turn order
   dominates strategy differences.
2. **A greedy human-proxy does NOT dominate the current bots** — 22.1% is *below* fair share and
   below a bot's 23.6%. The heuristic bots (with rare-set protection + set-building) already play
   competitively against a greedy human heuristic.
3. **Implication:** the "human always wins" is most likely due to *higher-order* human play —
   multi-turn planning, opponent denial, reading the market — that a reactive heuristic proxy
   doesn't capture, **not** a raw bot weakness. Buffing the reactive heuristic (e.g., rare timing)
   may move the needle little against a greedy yardstick.

### Target band + implications for next stories

- **Target:** no single strategy above ~30% in a 4-player game; ideally shrink the seat-order
  spread. (Fair share is 25%.)
- **ROC-206 (rare timing / hold-for-bonus):** bots already hold rares for 3+; expect small gains
  vs the greedy proxy — consider re-scoping toward *lookahead/denial* instead.
- **Seat fairness:** rotate the starting seat per round — falls out naturally of ROC-193
  (best-of-3 match structure).
- **Sparring target:** to get optimization signal, build a *stronger* human-proxy (1-ply
  lookahead) so improvements are measurable against a genuinely strong line.

### smartBot — 1-ply lookahead (ROC-206 · 2026-08-13)

`public/strategies.js` `smartBot`: enumerates every legal move, simulates each on a
`structuredClone` of the state, scores the result with `evalPosition` (banked CR +
0.55× hand-sell potential + combo/rare/set bonuses + fleet value), and plays the best.

Comparison (1000 games/seat, seed 1; challenger at each seat vs 3 of the field, avg):

| smartBot vs… | win % | +ties | avgScore | by seat |
|---|---|---|---|---|
| 3× default bot | **33.2%** | 36.4% | 51.3 | s0 40.7 · s1 35.1 · s2 28.8 · s3 28.1 |
| 3× human-proxy | **37.0%** | 40.7% | 51.5 | s0 44.1 · s1 40.4 · s2 34.2 · s3 29.4 |

Fair share = 25%. smartBot beats a default bot's share by **1.49×**, and clears fair share
even from the worst (last) seat — the evaluation overcomes the first-mover disadvantage.
Next: opponent-denial + deeper fleet planning (ROC-207), then wire as the "Hard" tier (ROC-208).

> **Tuning edge (flagged by independent-tester, 2026-08-13):** in near-tie positions
> `evalPosition` can value grabbing a rare pickup over banking an already-complete combo
> (e.g. sell-3-spice ≈ 16.0 vs take-diamond-keeping-spice ≈ 16.1). Legal and often fine
> (the combo is sold next turn), but revisit the discount (0.55) / combo (+4) weights, or a
> tie-break toward banked (realized) score, during the holistic re-tune in ROC-207.

### Difficulty tiers (ROC-208 · 2026-08-13)

`public/strategies.js` `DIFFICULTY = { easy: easyBot, normal: botPlay, hard: smartBot }`
(`DIFFICULTY_ORDER = ["easy","normal","hard"]`). Live game routes bot turns through
`DIFFICULTY[difficulty]`; a bottom-left selector (persisted to localStorage) switches it.

- **easy** — `easyBot`, a "reckless" personality: cashes the first sellable good at its
  minimum count (dumps rares at 2, commons at 1), never holds for a combo bonus, never builds.
- **normal** — `botPlay`, the balanced greedy heuristic.
- **hard** — `smartBot`, 1-ply lookahead + evaluation.

Ladder (each tier as challenger vs 3 Normal bots, 800 games/seat avg): **easy 0.0% · normal 23.4%
· hard 33.8%** (fair share 25%). Monotonic and decisive. Covered by `tests/strategies.test.ts`.
