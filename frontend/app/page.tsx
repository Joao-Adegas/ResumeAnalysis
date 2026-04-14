"use client";

import axios from "axios";
import { useState } from "react";

type Job = {
  resume: string,
  title: string,
  company: string,
  location: string,
  remote: boolean,
  url: string,
  matchScore: number,
  matchReason: number
}
type ApiResponse = {
  jobRecommendations: Job[];
};

  const jobRecommendations = [
    {
      company: "Pound for Pound",
      location: "München",
      matchReason:
        "Excelente oportunidade para aplicar habilidades em Design e UI/UX em um contexto de mídia social.",
      matchScore: 95,
      remote: false,
      resume:
        "Com sua habilidade em Design e experiência em UI/UX, a vaga de Social-Media / Youtube Content Creator/In (M/W/D) Als Werkstudent/In em Pound for Pound é uma ótima oportunidade para você aplicar suas habilidades criativas em um contexto de mídia social.",
      title:
        "Social-Media / Youtube Content Creator/In (M/W/D) Als Werkstudent/In",
      url: "https://www.arbeitnow.com/jobs/companies/pound-for-pound/social-media-youtube-content-creator-in-als-werkstudent-in-munchen-419540",
    },
    {
      company: "Q Media World",
      location: "Munich",
      matchReason:
        "Excelente oportunidade para trabalhar com tecnologias de Design avançadas.",
      matchScore: 80,
      remote: true,
      resume:
        "Seu conhecimento em Adobe Photoshop, Illustrator e InDesign é uma grande atitude para a vaga de Grafiker w/m/d em Q Media World, onde você pode trabalhar com tecnologias de Design avançadas.",
      title: "Grafiker w/m/d",
      url: "https://www.arbeitnow.com/jobs/companies/q-media-world/grafiker-munich-407522",
    },
    {
      company: "Fifteen-Love GbR",
      location: "Frankfurt am Main",
      matchReason:
        "Excelente oportunidade para aplicar habilidades em Design em um contexto de mídia social.",
      matchScore: 85,
      remote: false,
      resume:
        "Com sua experiência em Figma e XD, a vaga de Social Media Management Werkstudent (m/w/d) em Fifteen-Love GbR é uma ótima oportunidade para você aplicar suas habilidades em Design em um contexto de mídia social.",
      title: "Social Media Management Werkstudent (m/w/d)",
      url: "https://www.arbeitnow.com/jobs/companies/fifteen-love-gbr/social-media-management-werkstudent-frankfurt-am-main-84380",
    },
  ];

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Job[]>([]);


  async function sendResume(file: File | null) {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", file);

      const res = await axios.post<ApiResponse>(
        "http://localhost:8080/doc/analyse",
        formData
      );
      console.log(res.data);

      const jobsWithId = res.data.jobRecommendations.map(job => ({
       ...job,
        id: crypto.randomUUID()
      }));

      setJob(jobsWithId);
      return res.data;
    } catch (e) {
      console.error(e);
      setError("Erro ao enviar pdf");
      return null;
    }
  }



  return (
    <section>
      <div className="flex flex-col gap-2 h-screen items-center justify-center p-6">
        {job.length === 0 ? (
          <>
          <div>
            <div className="text-center">
              <h2 className="text-3xl font-bold p-4 text-white">Encontra sua <span className="text-green-400">vaga ideal</span></h2>
              <p className="text-[hsl(215,12%,50%)]">Faça upload do seu currículo e nossa IA encontrará as melhores oportunidades para você.</p>
            </div>


            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-800 rounded-xl cursor-pointer transition hover:border-green-600">

                {!loading ? (
                  <>
                    <div className="w-16 h-auto bg-gray-900 rounded-2xl">
                      <img src="/assets/arrow-up-from-bracket-solid.png" className="p-5" alt="icon" srcSet="" />
                    </div>
                    <p className="text-gray-100 font-medium">Arraste seu currículo aqui</p>
                    <p className="text-sm text-gray-500">ou clique para selecionar • PDF, DOC, DOCX</p>
                    <input id="file-upload" type="file" className="hidden" onChange={
                      (e) => {

                        const file = e.target.files?.[0];
                        if (!file) return
                        sendResume(file);
                      }
                    } />
                  </>
                ) : (
                  <>
                    <p className="text-white">loading...</p>
                  </>
                )}
              </label>
            </div>

          </div>
          </>
        ) : job && job.map((a) => (
          <div key={`${a.url}-${a.company}-${a.matchScore}-${a.location}-${a.matchReason}-${a.title}`} className="text-white">
            <p>{a.title}</p>
          </div>
        ))
        }

        {error && <p className="text-red-500">{error}</p>}


      </div>
    </section>
  );
}

