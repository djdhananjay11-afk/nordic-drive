# Norway EV brand catalogue checklist

Research date: 2026-09-11.

Scope: battery-electric passenger-car brands relevant to the Norwegian catalogue, including established and niche brands. These are brands sold or represented in Norway, not necessarily Norwegian-owned manufacturers. Excludes hybrids, motorcycles, buses, and commercial-only brands from the main list.

This is a research and implementation checklist, not a certified exhaustive register of every imported vehicle or a claim that every listed brand currently accepts new orders. Brand presence does not verify model availability, specifications, photo rights, or Norwegian prices. Before publication, verify at least one exact Norwegian BEV model/variant and record its source and date. Membership in an importer association alone does not prove BEV availability.

## Current code coverage

The main nordicCars catalogue in apps/web/features/cars/data/nordic-cars.ts contains 10 brands: Audi, BMW, BYD, Hyundai, Kia, NIO, Polestar, Porsche, Tesla, Volvo. Volkswagen appears in launch information but is not a main-catalogue brand.

## Main catalogue checklist

50 brand entries; 10 present and 40 missing from the main code catalogue. Present means represented in code, not independently verified. The remaining brands are candidates for model-level verification, not automatically approved public listings.

| Brand | Code coverage | Publication gate |
| --- | --- | --- |
| Alfa Romeo | Missing | Model/variant verification required |
| Alpine | Missing | Model/variant verification required |
| Audi | Present | Model/variant verification required |
| BMW | Present | Model/variant verification required |
| BYD | Present | Model/variant verification required |
| Changan / Deepal | Missing | Model/variant verification required |
| Citroën | Missing | Model/variant verification required |
| Cupra | Missing | Model/variant verification required |
| Dongfeng | Missing | Model/variant verification required |
| DS Automobiles | Missing | Model/variant verification required |
| Fiat | Missing | Model/variant verification required |
| firefly | Missing | Model/variant verification required |
| Ford | Missing | Model/variant verification required |
| GWM / ORA | Missing | Model/variant verification required |
| Honda | Missing | Model/variant verification required |
| Hongqi | Missing | Model/variant verification required |
| Hyundai | Present | Model/variant verification required |
| JAC | Missing | Model/variant verification required |
| Jeep | Missing | Model/variant verification required |
| KGM | Missing | Model/variant verification required |
| Kia | Present | Model/variant verification required |
| Lexus | Missing | Model/variant verification required |
| Lotus | Missing | Model/variant verification required |
| Lucid | Missing | Model/variant verification required |
| Maserati | Missing | Model/variant verification required |
| Maxus | Missing | Model/variant verification required |
| Mazda | Missing | Model/variant verification required |
| Mercedes-Benz | Missing | Model/variant verification required |
| MG | Missing | Model/variant verification required |
| MINI | Missing | Model/variant verification required |
| Mitsubishi | Missing | Model/variant verification required |
| NIO | Present | Model/variant verification required |
| Nissan | Missing | Model/variant verification required |
| Opel | Missing | Model/variant verification required |
| Peugeot | Missing | Model/variant verification required |
| Polestar | Present | Model/variant verification required |
| Porsche | Present | Model/variant verification required |
| Renault | Missing | Model/variant verification required |
| Seres | Missing | Model/variant verification required |
| Škoda | Missing | Model/variant verification required |
| smart | Missing | Model/variant verification required |
| Subaru | Missing | Model/variant verification required |
| Suzuki | Missing | Model/variant verification required |
| Tesla | Present | Model/variant verification required |
| Toyota | Missing | Model/variant verification required |
| Volkswagen | Missing | Model/variant verification required |
| Volvo | Present | Model/variant verification required |
| Voyah | Missing | Model/variant verification required |
| XPENG | Missing | Model/variant verification required |
| Zeekr | Missing | Model/variant verification required |

## New-entry and availability verification queue

Keep these separate until the Norwegian passenger-BEV order page, distributor and delivery status are established:

- Exlantix: represented in BIL and RSA material; verify the exact Norwegian model and ordering status.
- GAC / AION: present in BIL's brand listing; verify Norwegian model availability and canonical brand naming.
- Leapmotor: Norwegian distribution announcement found; distinguish announcement, ordering and delivery dates.
- Omoda: RSA announcement found; verify current Norwegian BEV ordering and delivery status.
- Jaecoo: RSA announcement found; only include battery-electric variants, not hybrids.
- M-Hero: BIL lists Mhero; verify BEV versus range-extender variant and local support.
- Cadillac: Norwegian-language warranty material found, but that alone does not establish current Norwegian direct sales.
- Dacia: Norwegian importer presence confirmed; confirm a Norwegian BEV offer rather than importing European Spring availability assumptions.
- Abarth: confirm Norwegian official versus parallel-import status before listing as a new-car brand.
- Genesis: do not infer Norwegian availability from other European markets; requires a Norwegian source.
- Land Rover / Range Rover: importer presence is not confirmation of a delivered BEV; verify launch and order status.
- Skywell: Norwegian-market references found in secondary coverage; importer/order status not established in this pass.

## Historical and specialist-import research queue

For a later used-car section, investigate Aiways, Fisker, Jaguar (I-PACE), Chevrolet (Bolt), Ford's older EVs, Mitsubishi i-MiEV, Think, Buddy and Kewet. Keep discontinued models under the same brand where appropriate. Rolls-Royce (Spectre) belongs in specialist/import verification until the Norwegian sales channel is confirmed. Rivian and other individual parallel imports should only be added from specific verified Norwegian evidence; no complete registration extract was obtained in this research.

Do not label an entire brand discontinued just because one model ended production.

## Naming rules

- Keep firefly separate from NIO as a customer-facing brand.
- Use Changan as the canonical brand with Deepal as an alias/model-family until the local naming policy is finalized.
- Avoid duplicate MG and IM entries for models locally sold as MG IM.
- Normalize GWM/ORA, KGM/SsangYong, Skoda/Škoda, Citroen/Citroën and Mercedes/Mercedes-Benz through aliases.
- Match registration/importer branding when deciding whether AION, M-Hero or other sub-brands need their own public entry.

## Sources checked

These sources support the research queue and brand presence; they do not verify every model or every brand's current order status.

- [Norwegian EV Association catalogue](https://elbil.no/elbiler/): independent model discovery, including newer brands such as Zeekr and Hongqi.
- [Norwegian importer association](https://www.bilimportorene.no/): importer-brand discovery, including Exlantix, GAC, Leapmotor, Omoda, Jaecoo, ORA and Mhero. Also lists non-BEV/commercial brands, so this is not itself an EV inventory.
- [Elbilvalg catalogue overview](https://elbilvalg.no/tabell.html): secondary cross-check for mainstream catalogue gaps.
- [Bertel O. Steen dealer network](https://www.bos.no/forhandlere): Norwegian representation for Mercedes-Benz, Peugeot, Citroën, DS, smart and Opel.
- [Alpine Norway](https://www.alpinecars.no/biler): Norwegian A290/A390 offers observed.
- [Changan Norway](https://www.changaneurope.com/no/): Deepal S05/S07 offers observed.
- [firefly Norway](https://www.firefly.world/no_NO): Norwegian brand site.
- [Lotus Norway](https://www.lotuscars.com/nb-NO): Eletre and Emeya offers observed; exclude hybrid variants.
- [Lucid Norway](https://lucidmotors.com/nb-no): Air and Gravity offers observed.
- [Seres Norway](https://seresnorge.no/): Seres 5 Norwegian product presence.
- [Suzuki e VITARA](https://suzuki.no/modeller/evitara): Norwegian BEV product presence.
- [Leapmotor Norwegian distribution news](https://elbil.no/nytt-elbil-merke-til-norge/): distribution announcement, not proof of every model being deliverable.
- [RSA Omoda/Jaecoo announcement](https://www.mynewsdesk.com/no/rsa/pressreleases/omoda-og-jaecoo-fortsetter-fremgangen-norge-staar-for-tur-3466502): Norwegian entry/distribution evidence.
- [OFV vehicle-data products](https://www.ofv.no/produkter): a potential authoritative coverage source; no licensed dataset was accessed.

## Implementation order

1. Verify and add Volkswagen, Škoda, Toyota, Mercedes-Benz, Nissan, Renault, Peugeot, Ford, MG and Opel. This is an editorial launch priority, not a measured market-share ranking.
2. Add the remaining mainstream and niche brands from verified model sheets.
3. Publish newer brands as upcoming only where dated launch evidence exists.
4. Add historical/import vehicles in a separate used-car scope.

Required per model: Norwegian market status, exact variant/model year, source URL, checked date, NOK price basis, measured versus estimated specification labels, and an approved real photo. Unknown data must remain unknown. Expanding brand coverage alone does not resolve the launch-readiness audit.

