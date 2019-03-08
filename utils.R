# Define cleaning function for client names

client_name_cleaning <- function(df) {
  if ("CLIENT_NAME" %in% colnames(df)) {
    
    df %<>% 
      mutate(CLIENT_NAME = str_trim(toupper(CLIENT_NAME), side = c("both")),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c("^S\\. ", "^S[^A-Z0-9]"), "SOUTH "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c(" S\\. ", " S[^A-Z0-9]"), " SOUTH "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c("^N\\. ", "^N[^A-Z0-9]"), "NORTH "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c(" N\\. ", " N[^A-Z0-9]"), " NORTH "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c("^E\\. ", "^E[^A-Z0-9]"), "EAST "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c(" E\\. ", " E[^A-Z0-9]"), " EAST "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c("^W\\. ", "^W[^A-Z0-9]"), "WEST "), 
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c(" W\\. ", " W[^A-Z0-9]"), " WEST "),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "ST\\.", "STREET"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "L.L.C.", "LLC"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, ", LLC", " LLC"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "L.L.P.", "LLP"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, ", LLP", " LLP"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "N.A.", "NA"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "INC\\.", "INC"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, ", INC", " INC"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, c("CORP\\. ", "CORP "), "CORPORATION "),
             # Specific hacks to group bigger players
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "^KPMG CORPORATE FINANCE LLC$", 
                                           "KPMG LLP"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "^PRICEWATERHOUSECOOPERS$", 
                                           "PRICEWATERHOUSECOOPERS LLP"),
             CLIENT_NAME = str_replace_all(CLIENT_NAME, "^UNITED PARCEL SERVICE INC$", 
                                           "UNITED PARCEL SERVICE"),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "JCDECAUX"), "JCDECAUX GROUP", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^CITIBANK"), "CITIBANK, NA", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^HERTZ"), "HERTZ GLOBAL", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^UNITED AIRLINES"), "UNITED AIRLINES", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^AIRBNB INC$"), "AIRBNB", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^SP PLUS CORP$"), "SP PLUS CORPORATION", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^CAR2GO NORTH A. LLC"), "CAR2GO NA LLC", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^LYFT INC$"), "LYFT", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^CVS HEALTH$"), "CVS CAREMARK CORP", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^NRG ENERGY SERVICES LLC$"), "NRG ENERGY INC",
                                   CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^PHILIPS LIGHTING NORTH AMERICA CORP$"), "PHILIPS LIGHTING",
                                   CLIENT_NAME),
             
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "CLEAR CHANNEL"), "CLEAR CHANNEL", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^THE BARRACK OBAMA FOUNAION"), 
                                   "THE BARACK OBAMA FOUNDATION", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "^AMAZON.COM$"), 
                                   "AMAZON", CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, '"I AM" TEMPLE OF CHICAGO INC'), 
                                   '"I AM" TEMPLE OF CHICAGO', CLIENT_NAME),
             CLIENT_NAME = if_else(str_detect(CLIENT_NAME, "1100 E 47TH STREET LLC"), 
                                   "1100 EAST 47TH STREET LLC", CLIENT_NAME)
      )
    
    return(df)
    
  } else {
    
    stop("Requires a column named CLIENT_NAME")
    
  }
  
}

# Define vector of vectors representing missing clients and related industries
missing_clients <- c(c("ARLINGTON PARK","RACING & WAGERING"),
                      c("CITIBANK, NORTH A.", "FINANCIAL / BANKING"),
                      c("HERTZ GLOBAL", "TRANSPORTATION"),
                      c("UNITED AIRLINES INC", "TRANSPORTATION"),
                      c("NORTH HIGHLAND", "OTHER"),
                      c("SONDER", "TOURISM & TRAVEL"),
                      c("ASSURED GUARANTY CORP.", "FINANCIAL / BANKING"),
                      c("TUK TUK CHICAGO", "TRANSPORTATION"),
                      c("BLACKSTONE ADMINISTRATIVE SERVICES L. P.", "FINANCIAL / BANKING"),
                      c("COMPUTER AID INC", "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES"),
                      c("LOGAN JONES LP", "OTHER"),
                      c("ASSOCIATION FOR ACCESSIBLE MEDICINES", "HEALTH/ MEDICAL / HOSPITAL"),
                      c("DELTA AIR LINES", "TRANSPORTATION"),
                      c("MEGABUS USA LLC", "TRANSPORTATION"),
                      c("WEC ENERGY GROUP INC", "PUBLIC UTILITIES"),
                      c("CONDUENT INC AND ITS AFFILIATES", "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES"),
                      c("LYFT INC", "TRANSPORTATION"),
                      c("CVS HEALTH", "HEALTH/ MEDICAL / HOSPITAL"),
                      c("NRG ENERGY SERVICES LLC", "PUBLIC UTILITIES"),
                      c("THE BARRACK OBAMA FOUNAION", "RELIGIOUS / NON-PROFIT ORGANIZATIONS"),
                      c("VENDOR ASSISTANCE PROGRAM LLC", "OTHER"),
                      c("DCI GROUP AZ LLC", "PUBLIC RELATIONS & ADVERTISING"),
                      c("VMWARE", "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES"),
                      c("SPOTHERO INC", "TRANSPORTATION"),
                      c("SENTINEL TECHNOLOGIES", "INFORMATION / TECHNOLOGY PRODUCTS OR SERVICES"),
                      c("ALLIEDBARTON SECURITY SERVICES LLC", "OTHER")
                     )

# Source: https://paulvanderlaken.com/2018/08/29/add-a-self-explantory-legend-to-your-ggplot2-boxplots/
ggplot_box_legend <- function(family = "serif"){
  
  # Create data to use in the boxplot legend:
  set.seed(100)
  
  sample_df <- data.frame(parameter = "test",
                          values = sample(500))
  
  # Extend the top whisker a bit:
  sample_df$values[1:100] <- 701:800
  # Make sure there's only 1 lower outlier:
  sample_df$values[1] <- -350
  
  # Function to calculate important values:
  ggplot2_boxplot <- function(x){
    
    quartiles <- as.numeric(quantile(x, 
                                     probs = c(0.25, 0.5, 0.75)))
    
    names(quartiles) <- c("25th percentile", 
                          "Median",
                          "75th percentile")
    
    IQR <- diff(quartiles[c(1,3)])
    
    upper_whisker <- max(x[x < (quartiles[3] + 1.5 * IQR)])
    lower_whisker <- min(x[x > (quartiles[1] - 1.5 * IQR)])
    
    upper_dots <- x[x > (quartiles[3] + 1.5*IQR)]
    lower_dots <- x[x < (quartiles[1] - 1.5*IQR)]
    
    return(list("quartiles" = quartiles,
                "25th percentile" = as.numeric(quartiles[1]),
                "Median" = as.numeric(quartiles[2]),
                "75th percentile" = as.numeric(quartiles[3]),
                "IQR" = IQR,
                "upper_whisker" = upper_whisker,
                "lower_whisker" = lower_whisker,
                "upper_dots" = upper_dots,
                "lower_dots" = lower_dots))
  }
  
  # Get those values:
  ggplot_output <- ggplot2_boxplot(sample_df$values)
  
  # Lots of text in the legend, make it smaller and consistent font:
  update_geom_defaults("text", 
                       list(size = 3, 
                            hjust = 0,
                            family = family))
  # Labels don't inherit text:
  update_geom_defaults("label", 
                       list(size = 3, 
                            hjust = 0,
                            family = family))
  
  # Create the legend:
  # The main elements of the plot (the boxplot, error bars, and count)
  # are the easy part.
  # The text describing each of those takes a lot of fiddling to
  # get the location and style just right:
  explain_plot <- ggplot() +     
    stat_boxplot(data = sample_df,aes(x = parameter, y=values), geom ='errorbar', width = 0.3) + 
    geom_boxplot(data = sample_df,aes(x = parameter, y=values), width = 0.3, fill = "lightgrey") +
    geom_text(aes(x = 1, y = 950, label = "500"), hjust = 0.5) + 
    geom_text(aes(x = 1.17, y = 950, label = "Number of values"), fontface = "bold", vjust = 0.4) + 
    theme_minimal(base_size = 5, base_family = family) + 
    geom_segment(aes(x = 2.3, xend = 2.3, y = ggplot_output[["25th percentile"]], yend = ggplot_output[["75th percentile"]])) +
    geom_segment(aes(x = 1.2, xend = 2.3, y = ggplot_output[["25th percentile"]], yend = ggplot_output[["25th percentile"]])) +     
    geom_segment(aes(x = 1.2, xend = 2.3, y = ggplot_output[["75th percentile"]], yend = ggplot_output[["75th percentile"]])) + 
    geom_text(aes(x = 2.4, y = ggplot_output[["50th percentile\n(median)"]]), label = "Interquartile\nrange", fontface = "bold", vjust = 0.4) +     
    geom_text(aes(x = c(1.17,1.17), y = c(ggplot_output[["upper_whisker"]], ggplot_output[["lower_whisker"]]),label = c("Largest value within 1.5 times\ninterquartile range above\n75th percentile",
                                                                                                                        "Smallest value within 1.5 times\ninterquartile range below\n25th percentile")), 
              fontface = "bold", vjust = 0.9) +     
    geom_text(aes(x = c(1.17),y =  ggplot_output[["lower_dots"]],label = "Outside value"), vjust = 0.5, fontface = "bold") + 
    geom_text(aes(x = c(1.9),y =  ggplot_output[["lower_dots"]],label = "-Value is >1.5 times and"), vjust = 0.5) +
    geom_text(aes(x = 1.17, 
                  y = ggplot_output[["lower_dots"]], 
                  label = "<3 times the interquartile range\nbeyond either end of the box"), 
              vjust = 1.5) +
    geom_label(aes(x = 1.17, y = ggplot_output[["quartiles"]], 
                   label = names(ggplot_output[["quartiles"]])),
               vjust = c(0.4,0.85,0.4), 
               fill = "white", label.size = 0) +
    ylab("") + xlab("") +
    theme(axis.text = element_blank(),
          axis.ticks = element_blank(),
          panel.grid = element_blank(),
          aspect.ratio = 4/3,
          plot.title = element_text(hjust = 0.5, size = 10)) +
    coord_cartesian(xlim = c(1.4,3.1), ylim = c(-600, 900)) +
    labs(title = "EXPLANATION")
  
  return(explain_plot) 
  
}
