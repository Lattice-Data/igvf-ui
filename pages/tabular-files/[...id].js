// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import FileTable from "../../components/file-table";
import { HostedFilePreview } from "../../components/hosted-file-preview";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricPanel } from "../../components/quality-metric";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import WorkflowTable from "../../components/workflow-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestQualityMetrics,
  requestWorkflows,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { sortedSeparatedList } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function TabularFile({
  tabularFile,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  qualityMetrics,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={tabularFile} />
      <EditableItem item={tabularFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={tabularFile.alternate_accessions}
        />
        <ObjectPageHeader item={tabularFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={tabularFile} />
          <FileHeaderDownload file={tabularFile}>
            <HostedFilePreview file={tabularFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={tabularFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={tabularFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={tabularFile}>
                {tabularFile.base_modifications?.length > 0 && (
                  <>
                    <DataItemLabel>Base Modifications</DataItemLabel>
                    <DataItemValue>
                      {sortedSeparatedList(tabularFile.base_modifications)}
                    </DataItemValue>
                  </>
                )}
              </FileDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {(tabularFile.assembly || tabularFile.transcriptome_annotation) && (
            <>
              <DataAreaTitle id="reference-source-details">
                Reference Source Details
              </DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {tabularFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{tabularFile.assembly}</DataItemValue>
                    </>
                  )}
                  {tabularFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {tabularFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {workflows.length > 0 && <WorkflowTable workflows={workflows} />}
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${tabularFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${tabularFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

TabularFile.propTypes = {
  // TabularFile object to display
  tabularFile: PropTypes.object.isRequired,
  // Documents associated with this file
  documents: PropTypes.array,
  // Files this file derives from
  derivedFrom: PropTypes.array,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Documents for file format specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Workflows that processed this file
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Quality metrics for this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this file
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tabularFile = (
    await request.getObject(`/tabular-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(tabularFile)) {
    const documents = tabularFile.documents
      ? await requestDocuments(tabularFile.documents, request)
      : [];
    const derivedFrom = tabularFile.derived_from
      ? await requestFiles(tabularFile.derived_from, request)
      : [];
    const inputFileFor =
      tabularFile.input_file_for?.length > 0
        ? await requestFiles(tabularFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (tabularFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        tabularFile.file_format_specifications.map((document) =>
          typeof document === "string" ? document : document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    let workflows = [];
    if (tabularFile.workflows?.length > 0) {
      const workflowPaths = tabularFile.workflows.map((workflow) =>
        typeof workflow === "string" ? workflow : workflow["@id"]
      );
      workflows = await requestWorkflows(workflowPaths, request);
    }
    const qualityMetrics =
      tabularFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(tabularFile.quality_metrics, request)
        : [];
    const attribution = await buildAttribution(tabularFile, req.headers.cookie);
    return {
      props: {
        tabularFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        qualityMetrics,
        pageContext: { title: tabularFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(tabularFile);
}
