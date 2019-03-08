# Client/Industry xwalk, keep name and primary industry only
cli_industry <- read_csv(here("data", "Clients_by_Industry.csv")) %>%
  select('CLIENT_NAME' = 'CLIENT NAME',
         'CLIENT_INDUSTRY' = 'CLIENT INDUSTRY') %>%
  # add additional rows for missing clients from utils file
  rbind(missing_clients)
cli_industry <- client_name_cleaning(cli_industry)
cli_industry %<>% mutate(# Industry manipulations
  CLIENT_INDUSTRY = str_trim(toupper(CLIENT_INDUSTRY), side = c("both")),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'KPMG'), 
                            "FINANCIAL / BANKING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CHICAGOLAND CHAMBER OF COMMERCE'), 
                            "TRADE & PROFESSIONAL ASSOCIATIONS", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'HONEYWELL INTERNATIONAL'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'PRICEWATERHOUSECOOPERS LLP'), 
                            "FINANCIAL / BANKING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'UNITED PARCEL SERVICE'), 
                            "TRANSPORTATION", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'FEDEX'), 
                            "TRANSPORTATION", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'JCDECAUX GROUP'), 
                            "MARKETING & SALES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CITIBANK, NA'), 
                            "FINANCIAL / BANKING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'HERTZ'), 
                            "TRANSPORTATION", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'UNITED AIRLINES'), 
                            "TRANSPORTATION", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'AIRBNB'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'PFIZER INC'), 
                            "HEALTH/ MEDICAL / HOSPITAL", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'LYFT'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CHICAGO NEIGHBORHOOD INITIATIVES'), 
                            "PUBLIC INTEREST", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CITY OF CHICAGO'), 
                            "GOVERNMENTAL UNITS", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CHICAGO DEPARTMENT OF AVIATION'), 
                            "TOURISM & TRAVEL", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'STEANS FAMILY FOUNAION'), 
                            "RELIGIOUS / NON-PROFIT ORGANIZATIONS", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'APPLE INC'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CASH AMERICA INTERNATIONAL'), 
                            "FINANCIAL / BANKING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'CLEAR CHANNEL'), 
                            "MARKETING & SALES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'GROWTH ENERGY'), 
                            "TRADE & PROFESSIONAL ASSOCIATIONS", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'MUSEUM OF CONTEMPORARY ART'), 
                            "ARTS/ ENTERTAINMENT", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'PHILIPS LIGHTING'), 
                            "MANUFACTURING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'THE LEONIS GROUP'), 
                            "PUBLIC RELATIONS & ADVERTISING", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'RELIABLE ASPHALT COMPANY'), 
                            "OTHER", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'AMAZON'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_NAME, 'DELL'), 
                            "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES", CLIENT_INDUSTRY),
  # Collapse industry categories
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_INDUSTRY, 'HEALTH'), 
                            "HEALTH", CLIENT_INDUSTRY),
  CLIENT_INDUSTRY = if_else(str_detect(CLIENT_INDUSTRY, 'TECHNOLOGY'), 
                            "INFO/TECH PRODUCTS OR SERVICES", CLIENT_INDUSTRY)
) %>%
  # For the remaineder of client industries with multiple industries, pick one
  arrange(CLIENT_NAME, CLIENT_INDUSTRY) %>%
  distinct(CLIENT_NAME, .keep_all = TRUE)


# Lobbyist compensation
compensation <- read_csv(here("data", "Compensation.csv")) 
compensation <- client_name_cleaning(compensation)
compensation %<>% left_join(cli_industry, by="CLIENT_NAME") %>%
  mutate(LOBBYIST_FIRST_NAME = toupper(LOBBYIST_FIRST_NAME),
         LOBBYIST_MIDDLE_INITIAL = toupper(LOBBYIST_MIDDLE_INITIAL),
         LOBBYIST_LAST_NAME = toupper(LOBBYIST_LAST_NAME),
         LOBBYIST_NAME = stringr::str_c(LOBBYIST_FIRST_NAME, LOBBYIST_LAST_NAME, sep=" "),
         LOBBYIST_NAME = if_else(str_detect(LOBBYIST_NAME, 'JOHN KELLY'), 'JOHN KELLY, JR.', LOBBYIST_NAME),
         PERIOD_START = as.Date(PERIOD_START, '%m/%d/%Y'),
         PERIOD_END = as.Date(PERIOD_END, '%m/%d/%Y'),
         CREATED_DATE = as.Date(CREATED_DATE, '%m/%d/%Y')
  )

# Political contributions

# Kurson Reyes Contributions

kurson_reyes <- read_csv(here("data", "kurson_reyes_receipts.csv")) %>%
  select(committee_name, last_name, first_name, received_date, aggregate_amount) %>%
  mutate(committee_name = str_to_upper(committee_name),
         last_name = str_to_upper(last_name),
         first_name = str_to_upper(first_name),
         # Group Reyes Kurson and Amy Kurson in Lobbyist Name
         LOBBYIST_NAME = 'REYES KURSON',
         # need to fix date transformation here!
         received_date = as.Date(str_match(received_date, '^[0-9/]+'), '%m/%d/%y')) %>%
  filter(received_date > as.Date('2011-12-31'))
colnames(kurson_reyes) <- c("RECIPIENT", "LOBBYIST_LAST_NAME", "LOBBYIST_FIRST_NAME", 
                            "CONTRIBUTION_DATE", "AMOUNT", "LOBBYIST_NAME") 

# All others
contribution <- read_csv(here("data", "Contributions.csv")) %>%
  mutate(RECIPIENT = toupper(RECIPIENT),
         LOBBYIST_FIRST_NAME = toupper(LOBBYIST_FIRST_NAME),
         LOBBYIST_LAST_NAME = toupper(LOBBYIST_LAST_NAME),
         LOBBYIST_NAME = stringr::str_c(LOBBYIST_FIRST_NAME, LOBBYIST_LAST_NAME, sep=" "),
         LOBBYIST_NAME = if_else(str_detect(LOBBYIST_NAME, 'JOHN KELLY'), 'JOHN KELLY, JR.', LOBBYIST_NAME),
         PERIOD_START = as.Date(PERIOD_START, '%m/%d/%Y'),
         PERIOD_END = as.Date(PERIOD_END, '%m/%d/%Y'),
         CONTRIBUTION_DATE = as.Date(CONTRIBUTION_DATE, '%m/%d/%Y')) %>%
  distinct(CONTRIBUTION_DATE, RECIPIENT, AMOUNT, LOBBYIST_NAME,.keep_all = TRUE) %>%
  # Bind Kurson Reyes contributions
  bind_rows(kurson_reyes)

# Lobbying activity
activity <- read_csv(here("data", "Lobbying_Activity.csv")) 
activity <- client_name_cleaning(activity)
activity %<>% left_join(cli_industry, by="CLIENT_NAME") %>%
  mutate(ACTION = toupper(ACTION),
         ACTION = if_else(str_detect(ACTION, 'BOTH'), 'BOTH', ACTION),
         ACTION_SOUGHT = toupper(ACTION_SOUGHT),
         DEPARTMENT = toupper(DEPARTMENT),
         LOBBYIST_FIRST_NAME = toupper(LOBBYIST_FIRST_NAME),
         LOBBYIST_MIDDLE_INITIAL = toupper(LOBBYIST_MIDDLE_INITIAL),
         LOBBYIST_LAST_NAME = toupper(LOBBYIST_LAST_NAME),
         LOBBYIST_NAME = stringr::str_c(LOBBYIST_FIRST_NAME, LOBBYIST_LAST_NAME, sep=" "),
         LOBBYIST_NAME = if_else(str_detect(LOBBYIST_NAME, 'JOHN KELLY'), 'JOHN KELLY, JR.', LOBBYIST_NAME),
         PERIOD_START = as.Date(PERIOD_START, '%m/%d/%Y'),
         PERIOD_END = as.Date(PERIOD_END, '%m/%d/%Y')
  )

# Lobbyist info
lobbyists <- read_csv(here("data", "Lobbyists.csv")) %>%
  mutate(SALUTATION = toupper(SALUTATION),
         FIRST_NAME = toupper(FIRST_NAME),
         MIDDLE_INITIAL = toupper(MIDDLE_INITIAL),
         LAST_NAME = toupper(LAST_NAME),
         SUFFIX = toupper(SUFFIX),
         EMPLOYER_NAME = toupper(EMPLOYER_NAME),
         LOBBYIST_NAME = stringr::str_c(FIRST_NAME, LAST_NAME, sep=" "),
         LOBBYIST_NAME = if_else(str_detect(LOBBYIST_NAME, 'JOHN KELLY'), 'JOHN KELLY, JR.', LOBBYIST_NAME)
  ) %>% 
  distinct()

# Lobbyist/Employer/Client combos
combinations <- read_csv(here("data", "Lobbyist__Employer__Client_Combinations.csv")) 
combinations <- client_name_cleaning(combinations)
combinations %<>% left_join(cli_industry, by="CLIENT_NAME") %>%
  mutate(LOBBYIST_SALUTATION = toupper(LOBBYIST_SALUTATION),
         LOBBYIST_FIRST_NAME = toupper(LOBBYIST_FIRST_NAME),
         LOBBYIST_MIDDLE_INITIAL = toupper(LOBBYIST_MIDDLE_INITIAL),
         LOBBYIST_LAST_NAME = toupper(LOBBYIST_LAST_NAME),
         LOBBYIST_SUFFIX = toupper(LOBBYIST_SUFFIX),
         EMPLOYER_NAME = toupper(EMPLOYER_NAME),
         LOBBYIST_NAME = stringr::str_c(LOBBYIST_FIRST_NAME, LOBBYIST_LAST_NAME, sep=" "),
         LOBBYIST_NAME = if_else(str_detect(LOBBYIST_NAME, 'JOHN KELLY'), 'JOHN KELLY, JR.', LOBBYIST_NAME))

# Councilmen
council <- read_csv(here("data", "aldermen_names.csv")) #read_excel(here("data", "aldermen.xlsx"))

# Ward boundaries
ward_boundaries <-fromJSON(here("data","ward_boundaries.geojson"))






