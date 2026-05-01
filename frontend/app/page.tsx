"use client";

import axios from "axios";
import { useState } from "react";
import { JobRecommendations } from "./components/jobCard";

type Job = {
  resume: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  matchScore: number;
  matchReason: string;   // ✅ correto
};

type ApiResponse = {
  jobRecommendations: Job[];
};

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
        `${process.env.NEXT_PUBLIC_API_URL}/doc/analyse`,
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
      <div className="flex flex-col gap-2 min-h-screen items-center justify-center py-10 px-4">
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
        ) : job.length > 0 && (
          <div>
            <h1>Vagas para você</h1>
            <JobRecommendations jobs={job} />
          </div>
        )
      }
        {error && <p className="text-red-500">{error}</p>}


      </div>
    </section>
  );
}

