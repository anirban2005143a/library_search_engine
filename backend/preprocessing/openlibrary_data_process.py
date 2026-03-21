# """
# This script processes the bulk download data from the Open Library project.
# It converts the large text files into smaller csv files which are easier to load into the db.
# Decide how large you would like to make each chunk using LINES_PER_FILE
# For editions, 3 million lines was about 3.24 gigs and about an hour to load.
# """

# import csv
# import ctypes as ct
# from multiprocessing import Pool
# import os

# # Optional if you want to make a smaller copy from the unzipped version for testing
# # sed -i '' '100000,$ d' ./data/unprocessed/ol_dump_editions.txt

# # You can run this file once with all 3 downloaded and unzipped files or run it as they come in.
# # Just make sure the end product in filenames.txt  looks like this
# # authors	0	False	{authors_2000.csv,authors_4000.csv,authors_6000.csv}
# # works	1	False	{works_2000.csv,works_4000.csv,works_6000.csv,works_8000.csv}
# # editions	2	False	{editions_2000.csv,editions_4000.csv,editions_6000.csv}

# # Field size limit: See https://stackoverflow.com/a/54517228 for more info on this setting
# csv.field_size_limit(int(ct.c_ulong(-1).value // 2))

# LINES_PER_FILE = 2000000

# INPUT_PATH = "./data/unprocessed/"
# OUTPUT_PATH = "./data/processed/"
# FILE_IDENTIFIERS = ["works"]


# def process_file(source_file: str, file_id) -> None:
#     """
#     Processes a single file by chunking it into smaller csv files.

#     :param source_file: The name of the file being processed
#     :param file_id: The id of the file to process
#     """
#     print(f"Currently processing {source_file}")

#     filenames = []
#     file_path = os.path.join(INPUT_PATH, (f"ol_dump_{source_file}.txt"))
#     print(file_path)

#     with open(file_path, encoding="utf-8") as csv_input_file:
#         reader = csv.reader(csv_input_file, delimiter="\t")

#         print(reader)

#         writer = None
#         for line, row in enumerate(reader):
            
#             print("reading lines")

#             # Every time the row limit is reached, write the chunked csv file
#             if line % LINES_PER_FILE == 0:
#                 chunked_filename = source_file + f"_{line + LINES_PER_FILE}.csv"
#                 filenames.append(chunked_filename)

#                 # Open a new file for writing
#                 output = open(
#                     os.path.join(OUTPUT_PATH, chunked_filename),
#                     "w",
#                     newline="",
#                     encoding="utf-8",
#                 )
#                 writer = csv.writer(
#                     output, delimiter="\t", quotechar="|", quoting=csv.QUOTE_MINIMAL
#                 )

#             if len(row) > 4:
#                 writer.writerow([row[0], row[1], row[2], row[3], row[4]])

#     with open(
#         os.path.join(OUTPUT_PATH, "filenames.txt"), "a", newline="", encoding="utf-8"
#     ) as filenames_output:
#         filenames_writer = csv.writer(
#             filenames_output, delimiter="\t", quotechar="|", quoting=csv.QUOTE_MINIMAL
#         )
#         filenames_writer.writerow(
#             [source_file, file_id, False, "{" + ",".join(filenames).strip("'") + "}"]
#         )
#         print(f"{source_file} text file has now been processed")


# if __name__ == "__main__":
#     with Pool() as pool:
#         results = []
#         for i, filename in enumerate(FILE_IDENTIFIERS):
#             results.append(pool.apply_async(process_file, args=(filename, i)))
#         # Wait for the processes to finish before exiting the main python program
#         for res in results:
#             res.wait()
#     print("Process complete")




import csv
import ctypes as ct
import os

# Fix for very large fields (Open Library JSON column)
csv.field_size_limit(int(ct.c_ulong(-1).value // 2))

LINES_PER_FILE = 2000

INPUT_PATH = "./data/unprocessed/"
OUTPUT_PATH = "./data/processed/"
FILE_IDENTIFIERS = ["works"]


def process_file(source_file: str, file_id: int) -> None:
    print(f"Currently processing {source_file}")

    filenames = []
    file_path = os.path.join(INPUT_PATH, f"ol_dump_{source_file}.txt")

    # Debug info
    print("File exists:", os.path.exists(file_path))
    if not os.path.exists(file_path):
        print("ERROR: File not found!")
        return

    print("File size (bytes):", os.path.getsize(file_path))

    os.makedirs(OUTPUT_PATH, exist_ok=True)

    with open(file_path, encoding="utf-8") as csv_input_file:

        writer = None
        output = None

        for line, raw_line in enumerate(csv_input_file):

            # Progress log every 100k lines
            if line % 100000 == 0:
                print(f"Processed {line} lines")

            row = raw_line.strip().split("\t")

            # Create new chunk file
            if line % LINES_PER_FILE == 0:
                if output:
                    output.close()

                chunked_filename = f"{source_file}_{line + LINES_PER_FILE}.csv"
                filenames.append(chunked_filename)

                output_path = os.path.join(OUTPUT_PATH, chunked_filename)
                output = open(output_path, "w", newline="", encoding="utf-8")

                writer = csv.writer(
                    output,
                    delimiter="\t",
                    quotechar="|",
                    quoting=csv.QUOTE_MINIMAL
                )

            # Write only valid rows
            if len(row) >= 5:
                writer.writerow(row[:5])

            break

        # Close last file
        if output:
            output.close()

    # Save filenames metadata
    filenames_txt_path = os.path.join(OUTPUT_PATH, "filenames.txt")

    with open(filenames_txt_path, "a", newline="", encoding="utf-8") as filenames_output:
        filenames_writer = csv.writer(
            filenames_output,
            delimiter="\t",
            quotechar="|",
            quoting=csv.QUOTE_MINIMAL
        )

        filenames_writer.writerow([
            source_file,
            file_id,
            False,
            "{" + ",".join(filenames) + "}"
        ])

    print(f"{source_file} text file has now been processed")


if __name__ == "__main__":
    for i, filename in enumerate(FILE_IDENTIFIERS):
        process_file(filename, i)

    print("Process complete")