"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  GraduationCap,
  LineChart,
  Upload,
  User2,
  Brain,
  Lightbulb,
  FileText,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  Share2,
  Download,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface FormData {
  gender: string;
  education: string;
  experience: string;
  job_category: string;
  personality: string;
}

interface IndustryComparison {
  min: number;
  low: number;
  avg: number;
  high: number;
  max: number;
}

interface PredictionResult {
  predicted_salary: number;
  industry_comparison: IndustryComparison;
  negotiation_tips: string[];
  resume_tips: string[];
}

export default function Explorer() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    education: "",
    experience: "",
    job_category: "",
    personality: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "salary_report.pdf";
      a.click();

      toast({
        title: "PDF Downloaded!",
        description: "Your report has been saved.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download PDF.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload a PDF file only.",
      });
    }
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "Resume Required",
        description: "Please upload a PDF resume before getting predictions.",
      });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("resume", file);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Prediction failed");

      const data: PredictionResult = await response.json();
      setResult(data);
      toast({
        title: "Prediction complete",
        description: "Your salary prediction is ready.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get prediction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareResults = async () => {
    if (!result) return;

    const shareData = {
      title: "My Salary Prediction Results",
      text: `My predicted salary is ₹${result.predicted_salary.toLocaleString()}. 
             The industry average is ₹${result.industry_comparison.avg.toLocaleString()}. 
             Check out this AI Salary Predictor for more insights!`,
      url: window.location.href, // Optional: Link to your app
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copied to clipboard!",
          description: "Share the results manually.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error sharing",
        description: "Failed to share results. Please try again.",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const fakeEvent = new Event("submit") as unknown as FormEvent;
      handleSubmit(fakeEvent);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3].map((step) => {
        const isActive = currentStep >= step;
        const isLastStep = step < 3;

        return (
          <div key={step} className="flex items-center">
            <div
              className={[
                "rounded-full h-12 w-12 flex items-center justify-center border-2 font-bold",
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-700 text-slate-500",
              ].join(" ")}
            >
              {step}
            </div>
            {isLastStep && (
              <div
                className={[
                  "h-1 w-16 mx-2 rounded",
                  currentStep > step ? "bg-indigo-600" : "bg-slate-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      {renderStepIndicator()}

      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <User2 className="h-5 w-5 text-indigo-400" />
              Gender
            </Label>
            <Select onValueChange={handleSelectChange("gender")}>
              <SelectTrigger className="bg-slate-800 border-slate-700 h-12">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              Education Level
            </Label>
            <Select onValueChange={handleSelectChange("education")}>
              <SelectTrigger className="bg-slate-800 border-slate-700 h-12">
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Bachelor's Degree">
                  Bachelor's Degree
                </SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="PhD Degree">PhD Degree</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-indigo-400" />
              Years of Experience
            </Label>
            <Input
              type="number"
              name="experience"
              min="0"
              step="0.5"
              className="bg-slate-800 text-white border-slate-700 h-12"
              placeholder="Enter years"
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-indigo-400" />
              Job Category
            </Label>
            <Select onValueChange={handleSelectChange("job_category")}>
              <SelectTrigger className="bg-slate-800 border-slate-700 h-12">
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software Engineer">
                  Software Engineer
                </SelectItem>
                <SelectItem value="Software Engineer">
                  Software Engineer
                </SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="Web Developer">Web Developer</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="IT Support">IT Support</SelectItem>
                <SelectItem value="UX/UI Designer">UX/UI Designer</SelectItem>
                <SelectItem value="Project Manager">Project Manager</SelectItem>

                <SelectItem value="Marketing Tech">Marketing Tech</SelectItem>
                <SelectItem value="Security/Infra Manager">
                  Security/Infra Manager
                </SelectItem>
                <SelectItem value="CTO/Director">CTO/Director</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-indigo-400" />
              Negotiation Style
            </Label>
            <Select onValueChange={handleSelectChange("personality")}>
              <SelectTrigger className="bg-slate-800 border-slate-700 h-12">
                <SelectValue placeholder="Select your style (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confident">Confident</SelectItem>
                <SelectItem value="Introverted">Introverted</SelectItem>
                <SelectItem value="Analytical">Analytical</SelectItem>
                <SelectItem value="Relationship-focused">
                  Relationship-focused
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-200 flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-indigo-400" />
              Upload Resume
            </Label>
            <div className="relative border-2 border-dashed border-indigo-700 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors bg-slate-800/50">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <Upload className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
                <p className="text-lg text-slate-300 mb-2">
                  Drag & drop your resume or click to browse
                </p>
                <p className="text-sm text-slate-400">
                  Accepted format: PDF only
                </p>
                {file && (
                  <p className="mt-4 text-green-400 bg-green-900/30 py-2 px-4 rounded-md inline-block">
                    {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 h-12 px-6"
          >
            Previous
          </Button>
        )}

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 h-12 px-6"
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 h-12 px-6"
            disabled={loading}
          >
            {loading ? "Analyzing Data..." : "Get Prediction"}
          </Button>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const chartData = [
      { name: "Min", value: result.industry_comparison.min, fill: "#6c75a2" },
      { name: "Low", value: result.industry_comparison.low, fill: "#818cf8" },
      {
        name: "Average",
        value: result.industry_comparison.avg,
        fill: "#4f46e5",
      },
      { name: "Your Salary", value: result.predicted_salary, fill: "#7c3aed" },
      { name: "High", value: result.industry_comparison.high, fill: "#8b5cf6" },
      { name: "Max", value: result.industry_comparison.max, fill: "#a78bfa" },
    ];

    // Calculate percentage difference from industry average
    const percentDiff = (
      (result.predicted_salary / result.industry_comparison.avg - 1) *
      100
    ).toFixed(1);
    const isAboveAverage =
      result.predicted_salary > result.industry_comparison.avg;

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-900 to-violet-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center space-y-4">
            <h3 className="text-xl font-medium text-indigo-200">
              Your Predicted Salary
            </h3>
            <div className="text-5xl font-bold text-white">
              ₹{result.predicted_salary.toLocaleString()}
            </div>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <span className="flex items-center gap-1">
                {isAboveAverage ? (
                  <TrendingUp className="h-4 w-4 text-green-300" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-300 rotate-180" />
                )}
                {isAboveAverage ? "+" : "-"}
                {Math.abs(parseFloat(percentDiff))}% compared to industry
                average
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-all">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
              <p className="text-slate-400 text-sm">Industry Minimum</p>
              <p className="text-2xl font-bold text-white">
                ₹{result.industry_comparison.min.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-all">
            <CardContent className="p-6 text-center">
              <BarChart2 className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
              <p className="text-slate-400 text-sm">Industry Average</p>
              <p className="text-2xl font-bold text-white">
                ₹{result.industry_comparison.avg.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-all">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
              <p className="text-slate-400 text-sm">Your Prediction</p>
              <p className="text-2xl font-bold text-white">
                ₹{result.predicted_salary.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-all">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
              <p className="text-slate-400 text-sm">Industry Maximum</p>
              <p className="text-2xl font-bold text-white">
                ₹{result.industry_comparison.max.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LineChart className="h-6 w-6 text-indigo-400" />
              Industry Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Amount",
                    ]}
                    itemStyle={{ color: "#818cf8" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                    background={{ fill: "transparent" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border-indigo-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
          <CardHeader>
            <div className="absolute top-4 left-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl ml-16 text-white">
              Target Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200">
              Based on your profile and market data, we recommend targeting
              <span className="font-bold text-white px-2">
                ₹{(result.predicted_salary * 1.1).toLocaleString()}
              </span>
              in your negotiations, which is approximately 10% above your
              current estimate. This target is ambitious yet achievable given
              your qualifications.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-indigo-400" />
                Negotiation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {result.negotiation_tips.map((tip, index) => (
                  <li
                    key={index}
                    className="bg-slate-800/80 border-l-4 border-indigo-500 p-4 rounded-r-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <p className="text-slate-200">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-400" />
                Resume Based Negotiation Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {result.resume_tips.map((tip, index) => (
                  <li
                    key={index}
                    className="bg-slate-800/80 border-l-4 border-violet-500 p-4 rounded-r-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <p className="text-slate-200">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => setResult(null)}
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            New Prediction
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-slate-700 hover:bg-slate-600 h-12 px-6"
            disabled={loading}
          >
            <Download className="h-5 w-5 mr-2" />
            {loading ? "Generating PDF..." : "Save as PDF"}
          </Button>

          <Button
            onClick={handleShareResults}
            className="bg-slate-700 hover:bg-slate-600 h-12 px-6"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-50 py-8">
      <div className="container mx-auto px-4">
        {!result ? (
          <Card className="max-w-4xl mx-auto bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold flex items-center gap-3 text-white">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                AI Salary Predictor
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Get personalized salary insights powered by advanced AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>{renderForm()}</CardContent>
          </Card>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                AI Salary Analysis
              </h1>
            </div>
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  );
}
