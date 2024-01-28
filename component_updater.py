import re

component_source = "components.html"
targets_source = "targets.txt"

components = {}
try:
    components_file = open(component_source,"r")
    components_file_array = components_file.readlines()
    components_file.close()
    name = "DEFAULT"
    for line in components_file_array:
        if line[:5] == "<!--[":
            if name != "DEFAULT":
                raise Exception("Component '"+line.strip()[5:-3]+"' was opened before the previous component closed")
            name = line.strip()[5:-3]
            if name in components:
                raise Exception("Componenet '"+name+"' is opened twice")
            components[name] = []
        elif line[:5] == "<!--]":
            if name == "DEFAULT":
                raise Exception("A component was closed before being opened")
            name = "DEFAULT"
        else:
            if name == "DEFAULT":
                continue
            else:
                components[name].append(line)
    if name != "DEFAULT":
        raise Exception("Component '"+name+"' was opened but not closed")
except Exception as e:
    print("ERROR:",str(e))
    exit()

print()
print("---- Components ----")
print()
for x in components:
    print(x)
    print()
    for line in components[x]:
        print("    "+line,end="")
    print()

targets_file = open(targets_source)
targets = [x.strip() for x in targets_file.readlines()]
targets_file.close()

print("Targets:", targets)

print()
print("Press enter to continue, input any string to cancel")
if input():
    exit()

for file_source in targets:
    print()
    print(file_source)

    try:
        file = open(file_source,"r")
        text_array = file.readlines()
        file.close()

        text = ""
        replacing = False
        for line in text_array:
            search = re.search(r"<!--[@\[\]]\w*-->",line)
            if search:
                indent = search.span()[0]
                component_name = search.group()[5:-3]

                if search.group()[4] != "]" and component_name not in components:
                    raise Exception("Cannot find componenet with the name '"+component_name+"'")

                if search.group()[4] == "@":
                    print("  Inserting component:",component_name)

                    text += " "*indent + "<!--[" + component_name + "-->\n"
                    for component_line in components[component_name]:
                        text += " "*indent + component_line
                    text += " "*indent + "<!--]-->\n"
                
                elif search.group()[4] == "[":
                    print("  Updating component:",component_name)
                    if replacing:
                        raise Exception("Component '"+component_name+"' was opened before the previous component closed")

                    replacing = True
                    text += " "*indent + "<!--[" + component_name + "-->\n"
                    for component_line in components[component_name]:
                        text += " "*indent + component_line
                    text += " "*indent + "<!--]-->\n"
                
                elif search.group()[4] == "]":
                    if replacing == False:
                        raise Exception("A component was closed before being opened")
                    replacing = False
            elif not replacing:
                text += line
        
        if replacing == True:
            raise Exception("Component '"+component_name+"' was opened but not closed")
        
        file = open(file_source,"w")
        file.write(text)
        file.close()

        print("  File has been updated")
    except Exception as e:
        print("  ERROR:",str(e))