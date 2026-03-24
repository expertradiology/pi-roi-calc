import { HUBSPOT_PORTAL_ID, HUBSPOT_FORM_ID } from "./constants";

export interface LeadFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  company_type: string;
  state: string;
}

export async function submitToHubSpot(data: LeadFormData): Promise<boolean> {
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

  const body = {
    fields: [
      { objectTypeId: "0-1", name: "firstname", value: data.firstname },
      { objectTypeId: "0-1", name: "lastname", value: data.lastname },
      { objectTypeId: "0-1", name: "email", value: data.email },
      { objectTypeId: "0-1", name: "phone", value: data.phone },
      { objectTypeId: "0-1", name: "company", value: data.company },
      { objectTypeId: "0-1", name: "company_type", value: data.company_type },
      { objectTypeId: "0-1", name: "state", value: data.state },
    ],
    context: {
      pageUri: "tradeshow-kiosk",
      pageName: "PI ROI Calculator — Tradeshow Kiosk",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.ok;
}
