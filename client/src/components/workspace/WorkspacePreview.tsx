import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  Table, 
  Calendar, 
  LayoutGrid, 
  List, 
  Eye,
  Users,
  Hash,
  Type,
  CheckSquare,
  Calendar as CalendarIcon,
  Link,
  TrendingUp
} from "lucide-react";
import type { Workspace } from "@shared/schema";

interface WorkspacePreviewProps {
  workspace: Workspace;
}

interface NotionProperty {
  name: string;
  type: string;
  config?: any;
}

interface NotionView {
  name: string;
  type: string;
  filters?: any[];
  sorts?: any[];
  layout?: string;
}

interface NotionDatabase {
  name: string;
  description: string;
  properties: NotionProperty[];
  views: NotionView[];
  relations: any[];
  sampleData: any[];
}

interface NotionPage {
  title: string;
  content: string;
  type: string;
}

interface WorkspaceSpec {
  title: string;
  description: string;
  databases: NotionDatabase[];
  pages: NotionPage[];
  theme: string;
  layout: string;
}

const getPropertyIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'title':
    case 'rich_text':
      return Type;
    case 'number':
      return Hash;
    case 'checkbox':
      return CheckSquare;
    case 'date':
      return CalendarIcon;
    case 'relation':
      return Link;
    case 'formula':
    case 'rollup':
      return TrendingUp;
    case 'people':
      return Users;
    default:
      return Database;
  }
};

const getViewIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'table':
      return Table;
    case 'board':
    case 'kanban':
      return LayoutGrid;
    case 'calendar':
      return Calendar;
    case 'gallery':
      return LayoutGrid;
    case 'list':
      return List;
    case 'timeline':
      return Calendar;
    default:
      return Eye;
  }
};

export function WorkspacePreview({ workspace }: WorkspacePreviewProps) {
  if (!workspace.aiResponse) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No workspace data available</p>
      </div>
    );
  }

  const spec = workspace.aiResponse as WorkspaceSpec;

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-6">
        {/* Workspace Overview */}
        <div>
          <h3 className="font-semibold text-lg mb-2" data-testid="text-workspace-title">
            {spec.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">{spec.description}</p>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{spec.theme}</Badge>
            <Badge variant="outline">{spec.layout}</Badge>
          </div>
        </div>

        {/* Databases */}
        {spec.databases && spec.databases.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Databases ({spec.databases.length})</span>
            </h4>
            <div className="space-y-4">
              {spec.databases.map((database, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base" data-testid={`text-database-title-${index}`}>
                      {database.name}
                    </CardTitle>
                    {database.description && (
                      <p className="text-sm text-muted-foreground">{database.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Properties */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">Properties ({database.properties?.length || 0})</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {database.properties?.slice(0, 6).map((property, propIndex) => {
                          const Icon = getPropertyIcon(property.type);
                          return (
                            <div key={propIndex} className="flex items-center space-x-2 text-sm">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{property.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {property.type}
                              </Badge>
                            </div>
                          );
                        })}
                        {database.properties && database.properties.length > 6 && (
                          <div className="text-xs text-muted-foreground">
                            +{database.properties.length - 6} more properties
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Views */}
                    {database.views && database.views.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Views ({database.views.length})</h5>
                        <div className="flex flex-wrap gap-2">
                          {database.views.map((view, viewIndex) => {
                            const Icon = getViewIcon(view.type);
                            return (
                              <div key={viewIndex} className="flex items-center space-x-1 bg-muted/50 rounded px-2 py-1">
                                <Icon className="w-3 h-3" />
                                <span className="text-xs">{view.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {view.type}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Relations */}
                    {database.relations && database.relations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Relations ({database.relations.length})</h5>
                        <div className="space-y-1">
                          {database.relations.map((relation, relIndex) => (
                            <div key={relIndex} className="text-xs text-muted-foreground flex items-center space-x-2">
                              <Link className="w-3 h-3" />
                              <span>{relation.property} → {relation.relatedDatabase}</span>
                              <Badge variant="outline" className="text-xs">
                                {relation.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Data Count */}
                    {database.sampleData && database.sampleData.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Includes {database.sampleData.length} sample {database.sampleData.length === 1 ? 'record' : 'records'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pages */}
        {spec.pages && spec.pages.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Pages ({spec.pages.length})</span>
            </h4>
            <div className="space-y-2">
              {spec.pages.map((page, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{page.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            if (!page.content) return 'No content';
                            
                            // Handle case where content is an object with text/type structure
                            let contentString = '';
                            if (typeof page.content === 'object') {
                              if (Array.isArray(page.content)) {
                                contentString = page.content
                                  .map(block => typeof block === 'object' && block.text ? block.text : String(block))
                                  .join(' ');
                              } else if (page.content.text) {
                                contentString = page.content.text;
                              } else {
                                contentString = JSON.stringify(page.content);
                              }
                            } else {
                              contentString = String(page.content);
                            }
                            
                            return contentString.length > 100 
                              ? `${contentString.substring(0, 100)}...` 
                              : contentString;
                          })()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {page.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{spec.databases?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Databases</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {spec.databases?.reduce((total, db) => total + (db.properties?.length || 0), 0) || 0}
                </div>
                <div className="text-xs text-muted-foreground">Properties</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {spec.databases?.reduce((total, db) => total + (db.views?.length || 0), 0) || 0}
                </div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
