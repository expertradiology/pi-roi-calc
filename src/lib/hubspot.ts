import { HUBSPOT_PORTAL_ID, HUBSPOT_FORM_ID } from "./constants";

export interface LeadFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  company_type: string;
  state: string;
  roi_net_annual_gain?: number;
  roi_percentage?: number;
  roi_value_per_case?: number;
}

export async function submitToHubSpot(data: LeadFormData): Promise<boolean> {
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

  const fields = [
    { objectTypeId: "0-1", name: "firstname", value: data.firstname },
    { objectTypeId: "0-1", name: "lastname", value: data.lastname },
    { objectTypeId: "0-1", name: "email", value: data.email },
    { objectTypeId: "0-1", name: "phone", value: data.phone },
    { objectTypeId: "0-1", name: "company", value: data.company },
    { objectTypeId: "0-1", name: "company_type", value: data.company_type },
    { objectTypeId: "0-1", name: "state", value: data.state },
  ];

  // Append ROI calculator values as hidden fields
  if (data.roi_net_annual_gain != null) {
    fields.push({ objectTypeId: "0-1", name: "roi_net_annual_gain", value: String(Math.round(data.roi_net_annual_gain)) });
  }
  if (data.roi_percentage != null) {
    fields.push({ objectTypeId: "0-1", name: "roi_percentage", value: String(Math.round(data.roi_percentage)) });
  }
  if (data.roi_value_per_case != null) {
    fields.push({ objectTypeId: "0-1", name: "roi_value_per_case", value: String(Math.round(data.roi_value_per_case)) });
  }

  const body = {
    fields,
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
