import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("re_Npf4PhxV_VQ7JkAwjroyKnkDMcnh8S21C") ?? "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ContactEmailRequest = await req.json();
    const { firstName, lastName, email, subject, message } = body;

    const ownerEmailResponse = await resend.emails.send({
      from: `onboarding@resend.dev ${email}`, // não use nome aqui sem domínio verificado
      to: ["guigapaulino@gmail.com"],
      subject: `Novo Contato: ${subject}`,
      html: `
        <h2>Nova mensagem de contato do site</h2>
        <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    const clientEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "Recebemos sua mensagem!",
      html: `
        <h1>Olá, ${firstName}!</h1>
        <p>Recebemos sua mensagem e retornaremos em breve.</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, ownerEmailResponse, clientEmailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Erro ao enviar emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);