/**
 * Location data utilities
 * Provides lists of US states and major cities for dropdowns
 */

export const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
  'District of Columbia',
];

/**
 * Major US cities list
 * Can be extended or replaced with API calls in the future
 */
export const MAJOR_CITIES = [
  // California
  'Los Angeles, CA',
  'San Diego, CA',
  'San Jose, CA',
  'San Francisco, CA',
  'Fresno, CA',
  'Sacramento, CA',
  'Long Beach, CA',
  'Oakland, CA',
  'Bakersfield, CA',
  'Anaheim, CA',
  
  // Texas
  'Houston, TX',
  'San Antonio, TX',
  'Dallas, TX',
  'Austin, TX',
  'Fort Worth, TX',
  'El Paso, TX',
  'Arlington, TX',
  'Corpus Christi, TX',
  
  // New York
  'New York, NY',
  'Buffalo, NY',
  'Rochester, NY',
  'Yonkers, NY',
  'Syracuse, NY',
  
  // Illinois
  'Chicago, IL',
  'Aurora, IL',
  'Naperville, IL',
  'Joliet, IL',
  
  // Pennsylvania
  'Philadelphia, PA',
  'Pittsburgh, PA',
  'Allentown, PA',
  'Erie, PA',
  
  // Arizona
  'Phoenix, AZ',
  'Tucson, AZ',
  'Mesa, AZ',
  'Chandler, AZ',
  
  // Florida
  'Jacksonville, FL',
  'Miami, FL',
  'Tampa, FL',
  'Orlando, FL',
  'St. Petersburg, FL',
  'Tallahassee, FL',
  
  // Georgia
  'Atlanta, GA',
  'Augusta, GA',
  'Columbus, GA',
  'Savannah, GA',
  
  // North Carolina
  'Charlotte, NC',
  'Raleigh, NC',
  'Greensboro, NC',
  'Durham, NC',
  
  // Michigan
  'Detroit, MI',
  'Grand Rapids, MI',
  'Warren, MI',
  
  // Ohio
  'Columbus, OH',
  'Cleveland, OH',
  'Cincinnati, OH',
  'Toledo, OH',
  
  // Washington
  'Seattle, WA',
  'Spokane, WA',
  'Tacoma, WA',
  
  // Massachusetts
  'Boston, MA',
  'Worcester, MA',
  'Springfield, MA',
  
  // Colorado
  'Denver, CO',
  'Colorado Springs, CO',
  'Aurora, CO',
  
  // Tennessee
  'Nashville, TN',
  'Memphis, TN',
  'Knoxville, TN',
  
  // Oregon
  'Portland, OR',
  'Eugene, OR',
  'Salem, OR',
  
  // Maryland
  'Baltimore, MD',
  
  // Missouri
  'Kansas City, MO',
  'St. Louis, MO',
  
  // Wisconsin
  'Milwaukee, WI',
  'Madison, WI',
  
  // Minnesota
  'Minneapolis, MN',
  'St. Paul, MN',
  
  // Louisiana
  'New Orleans, LA',
  'Baton Rouge, LA',
  
  // Virginia
  'Virginia Beach, VA',
  'Norfolk, VA',
  'Richmond, VA',
  
  // Nevada
  'Las Vegas, NV',
  'Reno, NV',
  
  // Oklahoma
  'Oklahoma City, OK',
  'Tulsa, OK',
  
  // Utah
  'Salt Lake City, UT',
  
  // Connecticut
  'Bridgeport, CT',
  'New Haven, CT',
  
  // Iowa
  'Des Moines, IA',
  
  // Arkansas
  'Little Rock, AR',
  
  // Mississippi
  'Jackson, MS',
  
  // Kansas
  'Wichita, KS',
  
  // New Mexico
  'Albuquerque, NM',
  
  // Nebraska
  'Omaha, NE',
  
  // West Virginia
  'Charleston, WV',
  
  // Idaho
  'Boise, ID',
  
  // Hawaii
  'Honolulu, HI',
  
  // New Hampshire
  'Manchester, NH',
  
  // Maine
  'Portland, ME',
  
  // Rhode Island
  'Providence, RI',
  
  // Montana
  'Billings, MT',
  
  // Delaware
  'Wilmington, DE',
  
  // South Dakota
  'Sioux Falls, SD',
  
  // North Dakota
  'Fargo, ND',
  
  // Alaska
  'Anchorage, AK',
  
  // Vermont
  'Burlington, VT',
  
  // Wyoming
  'Cheyenne, WY',
  
  // South Carolina
  'Columbia, SC',
  
  // Alabama
  'Birmingham, AL',
  'Montgomery, AL',
  'Mobile, AL',
  
  // Kentucky
  'Louisville, KY',
  'Lexington, KY',
  
  // District of Columbia
  'Washington, DC',
];

/**
 * Search for cities using a simple local search
 * In the future, this can be extended to use an API like Geonames or Google Places
 */
export async function searchCities(query: string): Promise<string[]> {
  if (!query || query.length < 2) {
    return MAJOR_CITIES.slice(0, 20); // Return top 20 by default
  }

  const lowerQuery = query.toLowerCase();
  return MAJOR_CITIES.filter((city) =>
    city.toLowerCase().includes(lowerQuery)
  ).slice(0, 50); // Limit results
}

