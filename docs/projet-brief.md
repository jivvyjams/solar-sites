# Assessment: Solar sites
## Full-stack developer · Praeter

### The task
Praeter advisors visit clients and estimate what solar panels would produce on their roof. Build a small web app for them.
An advisor can:
1. Create an account and log in.
2. Add, view, edit and delete client sites. A site has a client name, an address, a latitude and longitude, a roof area and a panel capacity in kWp.
3. See the estimated yearly and monthly solar production for a site.
4. See how much of that solar energy the client would use themselves, with and without a home battery of a capacity the advisor enters in kWh, and so what the battery adds.

_Advisors only see their own sites._

For point 4 you need the household's electricity use, which PVGIS does not provide. You decide how to model it; a simple assumption is fine, as long as the README states it and explains why.

### Data source
Use the public PVGIS API of the European Commission. It is free and needs no key.
- Documentation: https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en
- Example, monthly and yearly totals: https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=52.08&lon=4.31&peakpower=5&loss=14&optimalangles=1&outputformat=json
- Example, production per hour for one year: https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat=52.08&lon=4.31&peakpower=5&loss=14&pvcalculation=1&startyear=2023&endyear=2023&outputformat=json

### Rules
- Write the backend in Python and the frontend in TypeScript with React. The build tooling, backend framework and database are your choice; explain in  the README why you chose them.
- All calls to PVGIS go through your Python backend.
- AI tools are allowed. You are responsible for every line you hand in and will be asked to explain it.
- Include a README that says how to run the app and which choices you made.
- Hand in a link to a Git repository with a Dockerfile in its root. docker build -t solar . followed by docker run -p 8000:8000 solar must start the whole app on http://localhost:8000.
- Deploying it somewhere is welcome but not required; never pay for hosting for this.
- Do not send us any account or password. We start your app ourselves and register our own accounts on it.
- Keep the API contract in the appendix. Everything else (backend framework, database, session mechanism, structure) is your choice.

### What we look at
We do not grade the design or the number of features.
We look at whether the app is correct and safe, and whether you can explain why.
In the interview you walk us through your solution.

### Appendix: API contract
Use these routes and field names exactly as written. Field names are camelCase in JSON. Choose the
HTTP status code that fits each answer; in the interview we ask you why.

| Route                          | Body / Query                                                        | Answer                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| POST /api/register             | {email, password}                                                   | Creates the account and<br>starts a session. Fails when<br>the email exists.                                    |
| POST /api/login                | {email, password}                                                   | Starts a session. Fails on<br>wrong credentials.                                                                |
| POST /api/logout               | —                                                                   | Ends the session.                                                                                               |
| GET /api/me                    | —                                                                   | {email}. Fails without a<br>session.                                                                            |
| GET /api/sites                 | —                                                                   | [site], only the caller's sites.                                                                                |
| POST /api/sites                | {clientName, address, latitude,<br>longitude, roofAreaM2?, peakKwp} | The created site. Fails with a<br>message per field when<br>invalid.                                            |
| GET /api/sites/{id}            | —                                                                   | The site. Fails when it is not<br>the caller's.                                                                 |
| PUT /api/sites/{id}            | same as POST                                                        | The updated site.                                                                                               |
| DELETE /api/sites/{id}         | —                                                                   | Nothing.                                                                                                        |
| GET /api/sites/{id}/production | —                                                                   | {yearlyKwh, monthlyKwh:<br>[{month, kwh}] × 12}. Fails<br>clearly when PVGIS has no<br>data for the location.   |
| GET /api/sites/{id}/battery    | ?capacityKwh=&annualUseKwh=                                         | {productionKwh,<br>consumptionKwh,<br>withoutBattery:<br>{selfUsedKwh, …},<br>withBattery: {selfUsedKwh,<br>…}} |

A site is the input fields plus id . Sessions may be a cookie or a token: if you return a token, put it in
the JSON as token ; if you use a cookie and a CSRF token, return it as csrfToken and expect it in the X
-CSRF-Token header.