# Prompt dla Lovable - LifeQuest App Redesign

---

## PROMPT:

Zaprojektuj i zbuduj aplikacje webowa (React + TypeScript + Tailwind CSS + shadcn/ui) o nazwie **"LifeQuest"** - holistyczna aplikacja do samorozwoju oparta na grywalizacji, slogan: **"4 Pillars. One Journey. Better You."**

Aplikacja pomaga uzytkownikowi rozwijac sie w 4 filarach zycia: **Finance** (zloty/gold), **Mental Health** (niebieski/blue), **Physical Health** (czerwony/coral), **Nutrition** (zielony/green) - poswiecajac zaledwie 20 minut dziennie (5 min na filar).

---

## DESIGN & INSPIRACJA WIZUALNA

Styl wizualny inspirowany nowoczesnym dark-mode UI z aplikacji typu "life gamification":

### Paleta kolorow:
- **Tlo glowne**: Gleboki ciemny granatowo-czarny (#0F1123 lub podobny)
- **Karty**: Nieco jasniejszy odcien tla z subtelnymi gradientami (#1A1D35)
- **Akcent glowny**: Intensywny zielony (ale NIE identyczny jak Duolingo - moze byc bardziej neonowy/cyan-zielony, np. #00E5A0 lub #3DFFA2)
- **Filary**:
  - Finance: Zloty/Amber (#FFB020)
  - Mental: Niebieski (#5BABFF)
  - Physical: Koralowy/Czerwony (#FF6B6B)
  - Nutrition: Zielony (#58CC02)
- **XP/Punkty**: Fioletowy (#A78BFA)
- **Streak**: Gradient pomaranczowy -> czerwony
- **Tekst**: Bialy (#FFFFFF), drugorzedny (#8B8FA3), trzeciorzedny (#5A5E75)

### Styl UI:
- **Dark-first** - caly interfejs ciemny, z neonowymi akcentami
- **Karty z subtelnymi glow-efektami** - delikatne poswiety w kolorze filaru
- **Zaokraglone rogi** (16-24px radius) na kartach i przyciskach
- **Gradientowe tla** na waznych elementach (streak, XP, przyciski CTA)
- **Czytelna typografia** - bold headery, lekki font dla tresci
- **Animowane elementy** - pulsujace streak countery, glow na aktywnych elementach
- **Nowoczesny bottom navigation bar** z 5 zakladkami i ikonami
- **Progress bary i ringi** - wizualizacja postepu kolowymi i liniowymi paskami
- **Card-based layout** - kazda sekcja w osobnej karcie z cieniem/glow
- **Badges i ikony** - duzo wizualnego feedbacku (emoji, ikony, odznaki)

### WAZNE - Design ma byc INSPIROWANY ale NIE identyczny:
- Uzyj wlasnych proporcji layoutu
- Zmien rozmieszczenie elementow wzgledem inspiracji
- Dodaj wlasne akcenty designowe (np. inne ksztalny kart, inne rozmieszczenie statystyk)
- Zachowaj DUCHA inspiracji (ciemny, gamifikowany, neonowe akcenty) ale stwarz WLASNA identyfikacje wizualna

---

## STRUKTURA APLIKACJI - 5 GLOWNYCH ZAKLADEK (Bottom Navigation)

### 1. HOME (ikona: ogien/flame) - "Dashboard"

Glowny ekran z:

**a) Sekcja Hero - Streak Display:**
- Duzy, animowany (pulsujacy) counter aktualnego streaku (np. "12 dni")
- Ikona ognia z glow-efektem
- Pod spodem: "Najdluzszy streak: X dni"
- Streak dla kazdego filaru osobno (4 male ikony z liczbami)

**b) Dzisiejsze zadania (Daily Quests):**
- Lista 4 zadan (po jednym na filar), kazde z:
  - Kolorowa ikona filaru (emoji + kolor)
  - Tytul zadania
  - Opis (1 linia)
  - Czas trwania (np. "5 min")
  - Punkty do zdobycia (np. "+15 XP")
  - Przycisk "Wykonaj" / checkbox
  - Poziom trudnosci (easy/medium/hard)
- Pasek postepu dziennego (0/4 do 4/4)
- Nagroda za ukonczenie wszystkich: "+50 XP bonus"

**c) AI Coach Insight:**
- Karta z ikona AI (np. robocik/zielona lampka)
- Typ wiadomosci: tip/alert/praise/prediction
- Tresc insight (np. "Twoj streak finansowy jest zagrozony! Wykonaj szybkie zadanie")
- Przycisk akcji linkujacy do odpowiedniego ekranu

**d) Pillar Progress Grid:**
- 4 karty w gridzie 2x2
- Kazda karta: emoji filaru, nazwa, procentowy postep, mini progress bar
- Kolor karty odpowiada filarowi

**e) Quick Actions:**
- Siatka szybkich akcji: "Dodaj wydatek", "Zaloguj posilek", "Rozpocznij trening", "Medytacja"

---

### 2. PATHS (ikona: mapa/compass) - "Sciezki Nauki"

Ekran w stylu Duolingo z sciezkami rozwoju:

**a) Wybor filaru:**
- 4 zakladki/filtry u gory (Finance, Mental, Physical, Nutrition)
- Kazdy z wlasnym kolorem i emoji

**b) Sciezka Finance (metoda Dave'a Ramseya - 10 Baby Steps):**
- Step 1: Emergency Fund ($1,000)
- Step 2: Budget Mastery
- Step 3: Debt Snowball
- Step 4: Full Emergency Fund (3-6 mies.)
- Step 5: Investing Basics
- Step 6: Pay Off Home Early
- Step 7: Build Wealth & Give
- Step 8: Tax Optimization
- Step 9: Estate Planning
- Step 10: Financial Freedom
- Kazdy step z: ikona, tytul, opis, procent ukonczenia, lista lekcji

**c) Sciezka Mental Health (Huberman Protocols - 5 Foundations):**
- Foundation 1: Morning Sunlight & Sleep
- Foundation 2: Focus & Deep Work
- Foundation 3: Stress Management
- Foundation 4: Dopamine Regulation
- Foundation 5: Social Connection

**d) Sciezka Physical Health (5 Foundations):**
- Foundation 1: Movement Basics
- Foundation 2: Strength Training
- Foundation 3: Cardiovascular Health
- Foundation 4: Flexibility & Mobility
- Foundation 5: Recovery & Sleep

**e) Sciezka Nutrition (8 Foundations):**
- Foundation 1: Hydration
- Foundation 2: Protein Priority
- Foundation 3: Whole Foods
- Foundation 4: Meal Timing
- Foundation 5: Gut Health
- Foundation 6: Micronutrients
- Foundation 7: Mindful Eating
- Foundation 8: Sustainable Habits

**f) Wizualizacja sciezki:**
- Styl "mapa przygody" z polaczonymi node'ami
- Kazdy node = lekcja (education/practice/assessment)
- Node'y: ukonczone (zielony check), aktywny (pulsujacy), zablokowany (zamek)
- Linie laczace node'y z animacja postepu
- Karta "Kontynuuj nauke" u gory z ostatnia lekcja

---

### 3. ARENA (ikona: miecz/trophy) - "Rywalizacja"

Trzy podsekcje (tab selector u gory):

**a) Liga Tygodniowa (Weekly League):**
- Ranking 20 graczy (symulowanych + uzytkownik)
- Tabelka: pozycja, awatar, imie, XP w tym tygodniu
- Strefa awansu (top 3) - zielone podswietlenie
- Strefa degradacji (bottom 5) - czerwone podswietlenie
- Pozycja uzytkownika - niebieskie podswietlenie
- Tier obecny: Bronze -> Silver -> Gold -> Diamond (z ikona)
- Tygodniowy reset w poniedzialek

**b) Season Pass (7 Tierow):**
- Tier 1: Starter - Welcome Badge
- Tier 2: Committed - Streak Shield x1
- Tier 3: Rising - XP Boost 2x (24h)
- Tier 4: Dedicated - Custom Theme
- Tier 5: Warrior - Streak Shield x3
- Tier 6: Champion - Gold Badge
- Tier 7: Legend - Season Trophy
- Wizualny progress bar z odblokowanymi nagrodami
- Sezon trwa 90 dni

**c) Weekly Chest:**
- Skrzynia dostepna raz w tygodniu (poniedzialek)
- Animacja otwierania z glow-efektem
- Losowe nagrody: XP bonusy, streak shields, tematyczne itemy
- Wizualizacja z ikona skrzyni i zlotym swieceniem

---

### 4. TOOLS (ikona: narzedzia/wrench) - "Narzedzia"

Hub z dostepem do 18 narzedzi pogrupowanych wg filaru:

**a) Finance Tools (7):**
- Budget Manager - Budzet zero-bazowy, szablony, miesieczne sledzenie
- Expense Logger - Szybkie dodawanie wydatkow z kategoriami
- Debt Tracker - Metoda snowball, logowanie plat
- Emergency Fund - Wizualny postep do celu $1,000
- Savings Goals - Sledzenie celow oszczednosciowych
- Subscriptions Manager - Zarzadzanie subskrypcjami
- Net Worth Calculator - Kalkulator wartosci netto

**b) Mental Health Tools (4):**
- Dopamine Detox Tracker - Sledzenie detoksu dopaminowego
- Screen Time Tracker - Monitoring czasu ekranowego
- Morning Routine Builder - Budowanie porannej rutyny
- Meditation Timer - Timer medytacji z oddechem

**c) Physical Health Tools (4):**
- Workout Tracker - Szczegolowe logowanie treningow (sila, cardio, mobilnosc)
- Exercise Logger - Szybkie logowanie cwiczen
- Sleep Tracker - Sledzenie snu (czas, jakosc)
- Body Measurements - Waga, wzrost, BMI, pomiary ciala

**d) Nutrition Tools (3):**
- Meal Logger - Logowanie posilkow
- Water Tracker - Sledzenie nawodnienia (szklanka po szklance)
- Calorie Calculator - Kalkulator kalorii i TDEE

**e) Layout narzedzi:**
- Siatka kart pogrupowana kolorami filarow
- Kazda karta: ikona, nazwa, krotki opis, kolor filaru
- Filtrowanie wg filaru (4 zakladki)
- Kazde narzedzie otwiera sie jako osobna podstrona z pelnym interfejsem

---

### 5. PROFILE (ikona: osoba/user) - "Profil"

**a) Sekcja glowna:**
- Awatar uzytkownika (inicjaly w kole z gradientem)
- Imie, email
- Level badge (np. "Level 7")
- Pasek doswiadczenia do nastepnego poziomu (XP progress bar)
- Laczne XP / Laczne punkty

**b) Statystyki:**
- Karty ze statystykami:
  - Obecny streak (najdluzszy streak)
  - Ukonczonych zadan
  - Tier w lidze
  - Poziom Season Pass
- Wykres aktywnosci (heatmapa lub bar chart ostatnich 7 dni)

**c) Achievements (Odznaki):**
- Grid odznaczek z ikonami:
  - "First Steps" - Ukoncz pierwsze zadanie
  - "7 Day Warrior" - 7 dni streaku
  - "Balanced Life" - Ukoncz wszystkie 4 filary jednego dnia
  - "Growing Strong" - Osiagnij level 5
  - "Peak Performance" - Osiagnij level 10
- Odblokowane: kolorowe, z data odblokowania
- Zablokowane: szare/przyciemnione z warunkiem odblokowania

**d) Ustawienia:**
- Powiadomienia (wl/wyl)
- Motyw (na razie tylko dark)
- O aplikacji
- Wyloguj sie

---

## DODATKOWE EKRANY

### Ekran logowania:
- Prosty, elegancki dark design
- Logo LifeQuest z 4 kolorowymi pillarami
- Pola: email, haslo
- Przycisk "Zaloguj sie" (gradient zielony)
- Link "Zarejestruj sie"
- Przycisk "Tryb Demo" (ghost button)

### Onboarding (multi-step):
- 6 krokow z progress barem:
  1. Welcome - "Witaj w LifeQuest!"
  2. Basic Info - wiek, waga, wzrost
  3. Gender - plec (male/female/other)
  4. Financial Status - (debt/paycheck/stable/saving/investing)
  5. Activity Level - (sedentary/light/moderate/active)
  6. Sleep Quality - (1-5 skala)
- Kazdy krok jako karta z animacja przejscia
- Progress bar u gory

---

## SYSTEMY GRYWALIZACJI (krytyczne do zachowania)

### System Streakow:
- Osobny streak dla kazdego filaru
- Current streak + longest streak
- Wizualny fire emoji z glow
- Streak protection (streak shield z season pass)
- Animowany pulsujacy counter na dashboardzie

### System Level i XP:
- Level 1+ (start)
- 100 XP na level
- XP za: zadania (15), lekcje (50), streaki (5/dzien), osiagniecia (75), bonus dzienny (50)
- Widoczny progress bar do nastepnego poziomu
- Modal "Level Up!" z animacja przy awansie

### System Lig:
- 4 tiery: Bronze, Silver, Gold, Diamond
- 20 graczy w lidze (symulowani + gracz)
- Top 3 awansuje, bottom 5 degraduje
- Reset co tydzien (poniedzialek)

### Season Pass:
- 7 tierow z nagrodami
- Sezon trwa 90 dni
- Nagrody: odznaki, streak shields, XP boosty, motywy

### Osiagniecia:
- System odznaczek z warunkami odblokowania
- Popup z animacja przy odblokowaniu
- Grid w profilu

### AI Coach:
- Inteligentne podpowiedzi na dashboardzie
- Typy: tip, alert, praise, prediction
- Kontekstowe - na podstawie aktywnosci uzytkownika
- Z przyciskiem akcji

---

## FUNKCJONALNOSCI NARZEDZI - SZCZEGOLY

### Budget Manager:
- Kategorie wydatkow (jedzenie, transport, rozrywka, rachunki, etc.)
- Budzet miesieczny z limitami na kategorie
- Wizualny postep wydatkow vs budzet
- Szablony budzetow

### Debt Tracker:
- Lista dlugow (nazwa, kwota, minimalna rata, priorytet)
- Metoda snowball (od najmniejszego)
- Logowanie plat
- Wizualny postep splaty

### Workout Tracker:
- Typy: sila, cardio, mobilnosc
- Czas trwania, intensywnosc (RPE 1-10)
- Historia treningow
- Kalendarz aktywnosci

### Sleep Tracker:
- Czas polozenia/wstania
- Jakosc snu (1-5)
- Historia snu
- Srednia tygodniowa

### Water Tracker:
- Cel dzienny (np. 8 szklanek)
- Dodawanie szklanka po szklance
- Wizualny postep (ikona/animacja napelniania)
- Historia

### Calorie Calculator:
- Obliczanie BMR, TDEE
- Na podstawie danych z onboardingu (waga, wzrost, wiek, aktywnosc)
- Cel kaloryczny (deficyt/utrzymanie/nadwyzka)

---

## WYMAGANIA TECHNICZNE

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Zustand lub React Context
- **Routing**: React Router z bottom navigation
- **Storage**: localStorage (dane demo)
- **Animacje**: Framer Motion (glow, pulse, transitions)
- **Ikony**: Lucide React
- **Wykresy**: Recharts (dla statystyk)
- **Responsywnosc**: Mobile-first, ale dzialajaca na desktopie (max-width container)
- **PWA**: Manifest + service worker

---

## DANE DEMO

Aplikacja powinna dzialac z danymi demo:
- Uzytkownik: "Jan Kowalski", level 7, 680 XP
- Streak: Finance 12 dni, Mental 8 dni, Physical 15 dni, Nutrition 5 dni
- Kilka ukonczonych zadan i lekcji
- Aktywne zadania dzisiejsze
- Przykladowe dane finansowe (budzet, dlug, oszczednosci)
- Przykladowe dane zdrowotne (treningi, sen, woda)
- 3/7 odblokowanych osiagniec
- Pozycja #8 w lidze Silver
- Season Pass tier 3

---

## PRIORYTET IMPLEMENTACJI

1. **Layout i nawigacja** (5 zakladek, routing)
2. **Dashboard/Home** z streak hero i daily quests
3. **Profile** ze statystykami i osiagnieciami
4. **Tools** hub z przynajmniej 3 pelnimi narzedziami (Budget, Workout, Water Tracker)
5. **Paths** z wizualizacja sciezek nauki
6. **Arena** z liga i season pass
7. **Login i Onboarding**
8. **Pozostale narzedzia**

---

## KLUCZOWE ZASADY DESIGNU

1. **Kazdy element musi miec cel** - nie dodawaj dekoracyjnych elementow bez funkcji
2. **Kolor = filar** - uzytkownik natychmiast identyfikuje filar po kolorze
3. **Gamifikacja jest sercem UX** - XP, streaki, ligi musza byc widoczne i satysfakcjonujace
4. **Mobile-first** - projektuj najpierw na telefon (375px), potem skaluj
5. **Ciemny motyw** - nie ma opcji jasnego motywu, wszystko dark
6. **Feedback wizualny** - kazda akcja daje natychmiastowy feedback (animacja, zmiana koloru, popup)
7. **Inspiracja NIE kopia** - zachowaj ducha gamifikacji ale stwarz wlasna tozsamosc wizualna

---
