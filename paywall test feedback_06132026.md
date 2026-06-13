1. non logged in user sees /intelligence/trade page with all the 9 cards but is not able to access the full trade intelligence.
2. non logged in user is able to access the supply and demand matrix page /intelligence/trade/supply-demand. how can we treat this page? lock it since this is a major differenciator for souvera.
3. non logged in user is able to load the AGOA Legislative Tracker /intelligence/trade/agoa   and see and interact with contents. see full country drawer.
4. non logged in user is able to load the AfCFTA Status Tracker /intelligence/trade/afcfta and see and interact with the contents. see full country drawer 
5 logged in as explorer redirected to /intelligence/map
6. not able to see country FDI value with explorer and non logged in user accounts and only one sector is visible.
7. both non logged in and explorer users see only 3 indicators (gdp, gdp growth and population) on /intelligence/compare
8 with explorer account, unable to access /intelligence/trade/demand, /intelligence/trade/demand-Caribbean, /intelligence/trade/cbtpa/flows,  /intelligence/trade/afcfta/flows, /intelligence/trade/agoa/products, 
9. explorer account accesses /intelligence/trade/agoa, the AGOA Legislative Tracker. can explore the country eligibility cards and respective country drawer with more details
10. explorer account accesses /intelligence/trade/afcfta, the AfCFTA Status Tracker. can explore the country status cards and respective country drawer with more details
11. the AfCFTA Status Tracker /intelligence/trade/afcfta is missing some data. get the message "trade data pending" and "ull trade data (partners + products) coming in Phase 1 via Comtrade integration".
12. not able to access the /intelligence/trade/agoa/products?catalog=full with explorer account.
13. when loggin as explorer, user sees "Request access" above the intelligence map and next to "live curated data" button. 
14. explorer see only country overview and sectors with limited data.
15. business user reveals FDI data.
16. when loggin as business, user sees "Request access" above the intelligence map and next to "live curated data" button.
17. business account reveals 5 key sectors in the /intelligence/map?region=africa&selected=CIV. each sector reveals minimum data (rational and key indicators: streght and growth).
18. with business account, country terminal /country/CIV reveals fdi, inflation, fx rate and all the 7 tabs
19.  with business account, country terminal /country/CIV, the trade tap /country/CIV?tab=trade is missing key data (product categories, export potential, current AGOA export) in the AGOA Trade Advantage card.
20. business account user able to see full country comparaison data for all the countries already ingested. 
21. user should be able to download individual country card on the /intelligence/compare page. as of now, user is able to download both countries under a single card which should remain. make sure that we implement .png download button on hoover.
22. when loggin as explorer, professional, business, investor and institutional, user sees "Request access" above the intelligence map and next to "live curated data" button. when user is logged in, there should not be any "request access" button to prompt the user again to request access. instead, logged in user should be prompted to upgrade.
23. not all countries have full data due yet to be fully tested until all the data are ingested.
24. in the /intelligence/trade/demand, business, investor and institutional users see some of the Caribbean countries and territories in the different sector categories (in the African Import Demand Intelligence). what is your expert recommendation with this?
25.  CBTPA Import-Export Intelligence (/intelligence/trade/cbtpa/flows) has limited data so some data don't show such as "framework status" for some Caribbean countries.
26. CBTPA Import-Export Intelligence (/intelligence/trade/cbtpa/flows) drawer for country specific has different structure than those of the AfCFTA Import-Export Intelligence (/intelligence/trade/afcfta/flows)
27. Green tea (not fermented) #090210 is missing top African exporters.
28. all products should have top exporters under /intelligence/trade/agoa/products. need to remain consistent across.
29. under /intelligence/trade/agoa/products, ensure that all the products have proper analysis and the name of the product is referred in the analysis. for example for the "International travel receipts — visitors to Africa/Caribbean generate USD revenue" product, has this analysis: 

AGOA Export Potential — Africa supplies the US

African producers export this product duty-free to the US under AGOA at 0% versus the standard MFN tariff rate. This margin is the foundation of Africa's price competitiveness in the US market and directly supports manufacturing employment in beneficiary countries.

[Live trade volume data pending Comtrade ingest — country-level dollar figures will appear here once the data pipeline is live.]

also, for souvera analysis:

"This product represents a core AGOA export opportunity where African producers have demonstrated competitive advantage. The 0% duty-free access under AGOA is the decisive factor enabling African price competitiveness in the US market."

i understand that SDM scoring integration in Phase 2 — country × sector × product.


30. for the AGOA Product Finder (/intelligence/trade/agoa/products?catalog=full), we assume that the reemaining flows populate after Comtrade/Census ingest.
31. on /intelligence/Africa page, when user clicks on "explore market intelligence", the button does not redirect. when logged in, "explore market intelligence" do not serve any purpose until a country is picked from the map or from the top 10 economies which reveals the "open [country] terminal" to be redirected to /country/[country].
31. noticed that /country/NGA?tab=trade&section=us-trade-card#us-trade-card is missing AGOA Trade Advantage data (product categories, export potential, current agoa exports). these data are missing for many countries. 


Some errors:

## Error Type
Console Error

## Error Message
Lock "lock:sb-djafctgnjazjwwudkmnq-auth-token" was released because another request stole it

Next.js version: 16.2.4 (Turbopack)
---
## Error Type
Console AbortError

## Error Message
The lock request is aborted

Next.js version: 16.2.4 (Turbopack)







 