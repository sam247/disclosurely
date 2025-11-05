import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface RelatedPage {
  title: string;
  description: string;
  path: string;
}

interface RelatedPagesProps {
  pages: RelatedPage[];
  title?: string;
  description?: string;
  langPrefix?: string;
}

export const RelatedPages = ({
  pages,
  title = "Related Resources",
  description = "Learn more about related topics",
  langPrefix = ""
}: RelatedPagesProps) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <Link
              key={index}
              to={`${langPrefix}${page.path}`}
              className="block group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-blue-600 flex items-center justify-between">
                    {page.title}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {page.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
